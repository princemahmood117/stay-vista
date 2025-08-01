import useRole from "../../../hooks/useRole";
import AdminStatistics from "../Admin/AdminStatistics";
import GuestStatistics from "../Guest/GuestStatistics";
import HostStatistics from "../Host/HostStatistics";

const Statistics = () => {
    const [role] = useRole()
    return (
        <div>
            {role === 'admin' && <AdminStatistics></AdminStatistics>}
            {role === 'host' && <HostStatistics></HostStatistics>}
            {role === 'guest' && <GuestStatistics></GuestStatistics>}
        </div>
    );
};

export default Statistics;