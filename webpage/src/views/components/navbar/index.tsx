import { useState } from 'react';
export default function Navbar() {
    const [hidden, setHidden] = useState(false)
    return (
        <header>
            <nav
                className="
          flex flex-wrap
          items-center
          justify-between
          w-full
          py-2
          md:py-0
          px-6
          text-sm
          bg-[#4CB072]
          text-white
        "
            >
                <div>
                    <a href="#">
                        LOGO
                    </a>
                </div>

                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={() => {
                        setHidden(!hidden);
                    }} 
                    className="h-6 w-6 cursor-pointer md:hidden block"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                </svg>

                <div className={hidden ? "hidden" : "w-full md:flex md:items-center md:w-auto"}>
                    <ul
                        className="
                                pt-4
                                md:flex
                                md:justify-between 
                                md:pt-0"
                    >
                        <li>
                            <a className="md:p-4 py-2 block hover:text-black" href="#"
                            >Features</a>
                        </li>
                        <li>
                            <a className="md:p-4 py-2 block hover:text-black" href="#"
                            >Pricing</a>
                        </li>
                        <li>
                            <a className="md:p-4 py-2 block hover:text-black" href="#"
                            >FAQs</a>
                        </li>
                        <li>
                            <a className="md:p-4 py-2 block hover:text-black" href="#"
                            >Add to Chrome
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    )
}