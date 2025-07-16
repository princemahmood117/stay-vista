import useRole from "../../../hooks/useRole";
import AdminStatistics from "../Admin/AdminStatistics";

const Statistics = () => {
    const [role] = useRole()
    return (
        <div>
            {role === 'admin' && <AdminStatistics></AdminStatistics>}
        </div>
    );
};

export default Statistics;