import { Helmet } from 'react-helmet-async'
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import BookingDataRow from '../../../components/TableRows/BookingDataRow';

const ManageBookings = () => {
  // fetch all bookings for logged-in user (host)
    const axiosSecure = useAxiosSecure();
    const { user } = useAuth();
  
    const { data: bookings = [], isLoading, refetch } = useQuery({
      queryKey: ["my-bookings", user?.email],
      queryFn: async () => {
        const { data } = await axiosSecure.get(`/manage-bookings/${user?.email}`);
        return data;
      },
    });
    if (isLoading) return <LoadingSpinner></LoadingSpinner>;
  return (
    <>
      <Helmet>
        <title>Manage Bookings</title>
      </Helmet>

      <div className='container mx-auto px-4 sm:px-8'>
        <div className='py-8'>
          <div className='-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto'>
            <div className='inline-block min-w-full shadow rounded-lg overflow-hidden'>
              <table className='min-w-full leading-normal'>
                <thead>
                  <tr>
                    <th
                      scope='col'
                      className='px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal'
                    >
                      Title
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal'
                    >
                      Guest Info
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal'
                    >
                      Price
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal'
                    >
                      From
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal'
                    >
                      To
                    </th>
                    <th
                      scope='col'
                      className='px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal'
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => <BookingDataRow key={booking._id} booking={booking} refetch={refetch}></BookingDataRow>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ManageBookings