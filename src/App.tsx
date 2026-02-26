// import { Map } from './components/Map/Map';
import { Presentation } from './components/Oscars/Presentation';
import { Analytics } from "@vercel/analytics/react"

function App() {
  return (
    <>
      {/* 
      <Map /> 
      */}
      <Presentation />
      <Analytics />
    </>
  );
}

export default App;
