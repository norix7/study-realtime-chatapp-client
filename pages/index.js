import Head from 'next/head'
import styles from '../styles/Home.module.css'

/*
  socket.ioのサーバーと通信するため、socket.io-clientをインストール
*/
import io from "socket.io-client";
import { useState } from 'react';

const socket = io("https://study-realtime-chatapp-server.vercel.app");

/*
クライアント側のブラウザのConsoleに「〜has been blocked by CORS policy:〜」というエラーが表示される。
CORS（オリジン間リソース共有）のエラー
ここの解消方法について、以下の動画で解説している
https://youtu.be/dSllP4TRJls?t=840

ポートが違っているだけでも、オリジン（URL）が異なっている扱いになる。

サーバー側で通信を許可するオリジンを明示的に指定して上げる必要がある。
これを許可するにはどうすればいいのか？
↓
サーバー側でsocket.ioのサーバーのインスタンスを生成するとき、
const io = Server(server);
の第2引数に
{
  cors:{
    origin: "http://localhost:3000",
    credentials: true
  }
}
を渡してあげれば良い。
アクセスを許可するoriginが複数あるときは、配列にしてもOK。
*/

export default function Home() {

  const [name, setName] = useState("ななしさん");
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const handleSendMessage = () => {
    // サーバーへメッセージを送信する。
    // メッセージが入力されているときのみ送信する。
    if(message){
      let author_name = "";
      name ? author_name = name : (author_name = "ななしさん", setName("ななしさん"));
      // 以下では"send_message"という名前を付けてmessageを含むJSONデータを送信している。
      socket.emit("send_message", {name: author_name, message: message});
      // 送信後、inputを空にしたいので、setMessage関数を使ってmessageを空に。
      setMessage("");
    }
  };

  // サーバーからデータを受信
  socket.on("received_message", (data) => {
    // console.log("データを受信しました", data);
    setMessageList([data, ...messageList]);
  });

  return (
    <div className={styles.container}>
      <Head>
        <title>Socket.ioを使ったリアルタイムチャット</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <h2>チャットアプリ</h2>
        <div className={styles.attention}>
          <p>※個人情報や秘密情報を絶対に投稿しないでください。</p>
        </div>
        {/*
          inputでテキストを入力してEnterを押したら送信されるように
          formタグで囲んだ。合わせて標準のイベントを実行しないように
          e.preventDefault()を実行した。
        */}
        <form onSubmit={(e) => e.preventDefault()}>
          <div className={styles.chatInputButton}>
            <input
              type="text"
              placeholder="名前を入力してね"
              // inputの値をname変数を基準にして取得、変更する場合は、
              // 以下のようにonChangeとvalueの2つをセットで設定する
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === "Enter") e.preventDefault();
              }}
              value={name}
            />

            <input
              type="text"
              placeholder="チャットを入力してね"
              // inputの値をmessage変数を基準にして取得、変更する場合は、
              // 以下のようにonChangeとvalueの2つをセットで設定する
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              />
            <button onClick={() => handleSendMessage()}>チャット送信</button>
          </div>
        </form>
        {messageList.map((chat) => (
          <div className={styles.chatArea} key={chat.message} >
            {chat.message}
            <div className={styles.name}>投稿者：{chat.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
