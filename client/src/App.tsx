import { useEffect, useState } from 'react'
import './App.css'

function App() {

  const [initialMsg, setInitialMsg] = useState("INITIAL BLANK MESSAGE");
  useEffect(() => {
    const initialCommunication = async () => {
      try {
        const response = await fetch("http://localhost:3000/");

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setInitialMsg(data.message)
        console.log(data.message);
      } catch (error) {
        console.error('There was an error with the fetch operation:', error);
      }
    };


    initialCommunication();
  }, []);

  return (
    <>
      <div>
        {initialMsg}
      </div>
    </>
  )
}

export default App
