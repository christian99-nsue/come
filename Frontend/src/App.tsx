import AppRoutes from "./routes/AppRoutes";
import MobileFrame from "./components/MobileFrame/MobileFrame";
import "./App.css";

function App() {
  return (
    <MobileFrame>
      <AppRoutes />
    </MobileFrame>
  );
}

export default App;
