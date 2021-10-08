import React from 'react';

const TodoList = ({ todos, completeTodo, removeTodo }) => {
    return (
        <ul>
            {todos.map((todo, index) => {
                return <li key={todo.id} className="flex mb-4 items-center">
                    <p className={todo.isCompleted ? "w-full text-grey-darkest line-through" : "w-full text-grey-darkest"}>{todo.name}</p>
                    <button className="flex-no-shrink p-2 ml-2 mr-2 border-2 rounded hover:text-green-600"
                        onClick={() => completeTodo(index)}>Done</button>
                    <button className="flex-no-shrink p-2 ml-2 border-2 rounded hover:text-red-600"
                        onClick={() => removeTodo(index)}>Remove</button>
                </li>
            })}
        </ul>
    );
}

export default TodoList;