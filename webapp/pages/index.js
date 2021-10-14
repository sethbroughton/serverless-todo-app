import Head from 'next/head'
import React, { useState, useEffect } from 'react'
import TodoList from '../components/TodoList';
import { uuid } from 'uuidv4';

const Home = ( ) => {
  const [inputText, setInputText] = useState("");
  const [todoList, setTodoList] = useState([]);

  useEffect(() => {
    fetchTodos()
  },[])

  const fetchTodos = async () => {
    const response = await fetch(`https://spxxn8wa94.execute-api.us-east-1.amazonaws.com/prod/todos`, {
      headers: {
        'x-api-key': 'aiaEx,^MkI2957^llai,AT8y2=FmFrSj'
      },
    });
    const data = await response.json();
    setTodoList(data.Items);
  }

  const addTodoApi = async () => {
    const response = awat
  }

  const addTodo = (e) => {
    e.preventDefault();
    inputText !== "" ? setTodoList([...todoList, { name: inputText, id: uuid(), isCompleted: false }]) : null
    setInputText("");
  }

  const completeTodo = (index) => {
    const newTodos = [...todoList];
    newTodos[index].isCompleted = !newTodos[index].isCompleted;
    setTodoList(newTodos);
  }

  const removeTodo = (index) => {
    const newTodos = [...todoList];
    newTodos.splice(index,1);
    setTodoList(newTodos);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Todo App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          <span className="block text-indigo-600">The List</span>
        </h2>
      <div className="h-100 w-full flex items-center justify-center bg-teal-lightest font-sans">
        <div className="bg-white rounded shadow p-6 m-4 w-full lg:w-3/4 lg:max-w-lg">
          <div className="mb-4">
            <h1 className="text-grey-darkest"></h1>
            <form onSubmit={addTodo}>
              <div className="flex mt-4">
                <input className="shadow appearance-none border rounded w-full py-2 px-3 mr-4 text-grey-darker" placeholder="Add a Todo" name="text" type="text" value={inputText}
                  onChange={(e) => setInputText(e.target.value)} />
                <button type="submit" className="flex-no-shrink p-2 border-2 rounded text-teal border-teal hover:text-blue-600">Add</button>
              </div>
            </form>
          </div>
          <div>
          </div>
        </div>
      </div>
      <hr /><br />

      <TodoList todos={todoList} completeTodo={completeTodo} removeTodo={removeTodo} />

    </div>
  )
}

export default Home;




