import { Route, Routes } from "react-router-dom"
import Sidebar from "../../components/common/Sidebar"
import Inbox from "./Inbox"

const Dashboard = () => {
    return (
        <div>
            <Sidebar />
            <Routes>
                <Route path="/inbox" element={<Inbox />} />
                {/* Add other routes here */}
            </Routes>
        </div>
    )
}

export default Dashboard