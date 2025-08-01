import { Chart } from 'react-google-charts'
import PropTypes from "prop-types";
import { useEffect, useState } from 'react';
import Loader from '../../Loader/Loader';

 const options = {
  title: 'Bookings Over Time',
  curveType: 'function',
  legend: { position: 'bottom' },
  series: [{ color: '#F43F5E' }],
}


const BookingLineChart = ({data}) => {
  const [loading,setLoading] = useState(true)

  useEffect(()=> {
    setTimeout(()=> setLoading(false), 2000)
  },[])

  if(loading) return <p className='text-xl italic'>Loading chart.... <Loader></Loader> </p>
  return (
    data.length > 1 ? <Chart chartType='LineChart' width='100%' data={data} options={options} /> : <> <Loader></Loader> <p className='text-center italic mt-4'>not enough data .....</p></> 
  )
}


BookingLineChart.propTypes = {
  data: PropTypes.array,
};

export default BookingLineChart