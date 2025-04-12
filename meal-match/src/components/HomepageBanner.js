import Image from "next/image";

const HomepageBanner = ({text, image, bgColor, textColor, imageAlign}) => {
    return (
        <span className={`flex flex-col md:flex-row justify-between items-center p-8 md:p-16 shadow-md ${bgColor}`}>
            {imageAlign === "left" && (
                <div className="w-full md:w-1/2 flex justify-center mb-6 md:mb-0">
                <Image src={image} height={300} alt="Banner Image" />
                </div>
            )}
            <div className={`w-full md:w-1/2 text-center md:text-left text-3xl md:text-4xl font-bold ${textColor}`}>
                {text}
            </div>
            {imageAlign === "right" && (
                <div className="w-full md:w-1/2 flex justify-center mt-6 md:mt-0">
                <Image src={image} height={300} alt="Banner Image" />
                </div>
            )}
        </span>
    );
};

export default HomepageBanner;