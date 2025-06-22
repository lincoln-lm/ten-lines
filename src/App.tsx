import { useEffect, useRef, useState } from 'react'
import './App.css'
import fetchTestLibrary from './testLibrary'


function App() {
  const [libLoaded, setLibLoaded] = useState<boolean>(false);
  const lib = useRef<Awaited<ReturnType<typeof fetchTestLibrary>> | null>(null);
  const [count, setCount] = useState(0)

  const loadTestLibrary = async () => {
    lib.current = await fetchTestLibrary();
    setLibLoaded(true);
  }
  useEffect(() => {
    loadTestLibrary();
  }, []);

  if (!libLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <button onClick={() => lib.current?.testFunction().then(setCount)}>
        count is {count}
      </button>
    </>
  )
}

export default App
