import image from "../../assets/image.png";
export default function Header() {
  return (
    <>
      <div className="flex justify-between  bg-red-100">
        <div className="flex  justify-around w-1/4">
          <div className=" flex-col">
            <img className="h-16 w-16" src={image} alt="PLU" />
            <p className="ml-4">PLU</p>
          </div>
        </div>
        <div className="w-1/2">
          <ul className="flex justify-between mt-7">
            <li>Hospital Overview</li>
            <li>Our Services</li>
            <li>Find a doctor</li>
            <li>Lab Report</li>
            <li>Contact Us</li>
          </ul>
        </div>
        <div className="w-1/4 flex justify-center">
          <p className=" bg-red-400 mt-7 w-50 h-10 pl-5 bg-radial ">
            Book an appointment
          </p>
        </div>
      </div>
    </>
  );
}
