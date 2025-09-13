import React from "react";
import { ModeToggle } from "./mode-toggle";

const Footer = () => {
  return (
    <footer className="section-padding">
      <div className="max-w-[1600px] mx-auto w-full">
        <ModeToggle />
      </div>
    </footer>
  );
};

export default Footer;
