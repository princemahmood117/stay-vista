import { useState } from "react";
import AddRoomForm from "../../../components/Form/AddRoomForm";
import useAuth from "../../../hooks/useAuth";
import { imageUpload } from "../../../api/utils";
import { Helmet } from "react-helmet-async";
import { useMutation } from "@tanstack/react-query";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddRoom = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [imagePreview, setImagePreview] = useState();
  const [imageText, setImageText] = useState("");
  const [loading, setLoading] = useState(false);

  const [dates, setDates] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  
  const handleDateRange = (item) => {
    console.log(item.selection);
    setDates(item.selection);
  };


  const { mutateAsync } = useMutation({
    mutationFn: async (roomData) => {
      const { data } = await axiosSecure.post(`/add-room`, roomData);
      return data;
    },
    onSuccess: () => {
      toast.success("Room data added successully");
      navigate("/dashboard/my-listings");
      setLoading(false);
    },
  });

  const handleAddRoomForm = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const location = form.location.value;
    const category = form.category.value;
    const title = form.title.value;
    const to = dates.endDate;
    const price = form.price.value;
    const from = dates.startDate;
    const guests = form.total_guest.value;
    const bathrooms = form.bathrooms.value;
    const bedrooms = form.bedrooms.value;
    const description = form.description.value;
    const image = form.image.files[0];

    const host = {
      name: user?.displayName,
      image: user?.photoURL,
      email: user?.email,
    };

    try {
      const image_url = await imageUpload(image);
      const roomData = {
        location,
        category,
        title,
        from,
        to,
        price,
        guests,
        bathrooms,
        bedrooms,
        description,
        host,
        image: image_url,
      };
      console.table(roomData);
      // upload room data to databse
      await mutateAsync(roomData);
    } 
    
    catch (error) {
      console.log(error);
      toast.error("Error occured adding data!");
      setLoading(false);
    }
  };

  const handleImage = (image) => {
    setImagePreview(URL.createObjectURL(image));
    setImageText(image.name);
  };
  return (
    <div>
      <Helmet>
        <title>Add Room | Dashboard</title>
      </Helmet>
      <AddRoomForm
        dates={dates}
        handleDateRange={handleDateRange}
        handleAddRoomForm={handleAddRoomForm}
        setImagePreview={setImagePreview}
        imagePreview={imagePreview}
        handleImage={handleImage}
        imageText={imageText}
        loading={loading}
      ></AddRoomForm>
    </div>
  );
};

export default AddRoom;












// import { useState } from "react";
// import AddRoomForm from "../../../components/Form/AddRoomForm";
// import useAuth from "../../../hooks/useAuth";
// import { imageUpload } from "../../../api/utils";
// const AddRoom = () => {
//   const { user } = useAuth();
//   const [imagePreview, setImagePreview] = useState();
//   const [imageText, setImageText] = useState("Upload Image");
//   const [dates, setDates] = useState({
//     startDate: new Date(),
//     endDate: null,
//     key: "selection",
//   });

//   // date range handler
//   const handleDates = (item) => {
//     console.log(item);
//     setDates(item.selection);
//   };

//   // form handler
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const form = e.target;
//     const location = form.location.value;
//     const category = form.category.value;
//     const title = form.title.value;
//     const to = dates.endDate;
//     const from = dates.startDate;
//     const price = form.price.value;
//     const guests = form.total_guest.value;
//     const bathrooms = form.bathrooms.value;
//     const description = form.description.value;
//     const bedrooms = form.bedrooms.value;
//     const image = form.image.files[0];

//     const host = {
//       name: user?.displayName,
//       image: user?.photoURL,
//       email: user?.email,
//     };

//     try {
//       const image_url = await imageUpload(image);
//       console.log(image_url);

//       const roomData = {
//         location,
//         category,
//         title,
//         to,
//         from,
//         price,
//         guests,
//         bathrooms,
//         bedrooms,
//         host,
//         description,
//         image: image_url,
//       };

//       console.table(roomData);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   // handle Image change
//   const handleImage = (image) => {
//     setImagePreview(URL.createObjectURL(image));
//     setImageText(image.name);
//   };
//   return (
//     <div>
//       <AddRoomForm
//         dates={dates}
//         handleDates={handleDates}
//         handleSubmit={handleSubmit}
//         setImagePreview={setImagePreview}
//         imagePreview={imagePreview}
//         handleImage={handleImage}
//         imageText={imageText}
//       ></AddRoomForm>
//     </div>
//   );
// };

// export default AddRoom;
