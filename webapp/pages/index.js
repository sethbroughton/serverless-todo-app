import Head from 'next/head'
import React, { useState, useEffect } from 'react'

const Home = () => {
  const [inputText, setInputText] = useState("");
  const [historyList, setHistoryList] = useState([]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Todo App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <input
        onChange={(e) => {
          setInputText(e.target.value);
          setHistoryList([...historyList, e.target.value])
        }}
        placeholder="Let's do this..." /><br />
      {inputText}
      <hr/><br/>
      <ul>
        {historyList.map( (item) => {
          return <div>{item}</div>
        })}
      </ul>
    </div>
  )
}

export default Home;