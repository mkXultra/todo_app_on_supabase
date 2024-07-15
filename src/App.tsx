import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL!, process.env.REACT_APP_SUPABASE_ANON_KEY!);

interface Todo {
  id: number;
  task: string;
  is_completed: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('id', { ascending: true });
    if (error) console.error('Error fetching todos:', error);
    else setTodos(data || []);
  }

  async function addTodo() {
    if (newTask.trim() === '') return;
    const { data, error } = await supabase
      .from('todos')
      .insert({ task: newTask, is_completed: false })
      .select();
    if (error) console.error('Error adding todo:', error);
    else {
      setTodos([...todos, data[0]]);
      setNewTask('');
    }
  }

  async function toggleTodo(id: number, is_completed: boolean) {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !is_completed })
      .eq('id', id);
    if (error) console.error('Error updating todo:', error);
    else {
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, is_completed: !is_completed } : todo
      ));
    }
  }

  async function deleteTodo(id: number) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);
    if (error) console.error('Error deleting todo:', error);
    else {
      setTodos(todos.filter(todo => todo.id !== id));
    }
  }

  return (
    <div className="App">
      <h1>Todo App</h1>
      <div>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="新しいタスクを入力"
        />
        <button onClick={addTodo}>追加</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.is_completed}
              onChange={() => toggleTodo(todo.id, todo.is_completed)}
            />
            <span style={{ textDecoration: todo.is_completed ? 'line-through' : 'none' }}>
              {todo.task}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;