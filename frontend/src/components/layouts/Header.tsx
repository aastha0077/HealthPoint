import { Button } from "../ui/button";

function Header() {
  return (
    <div className="flex justify-around mt-2">
      <div>Logo</div>
      <ul className="flex w-1/2 justify-around  font-medium">
        <a href="/">
          <li>Hospital Overview</li>
        </a>
        <a href="services">
          <li>Our services</li>
        </a>

        <a href="lab-report">
          <li>Lab Report</li>
        </a>
        <a href="health-package">
          <li>Health Package</li>
        </a>

        <a href="contact-us">
          <li>Contact Us</li>
        </a>
      </ul>
      <div className="">
        <Button
          onClick={() => {
            window.location.href = "/appointment";
          }}
        >
          Book an appointment
        </Button>
      </div>

      <div>
        <div>Login</div>
        <div>Signup</div>
      </div>
    </div>
  );
}

export { Header };
