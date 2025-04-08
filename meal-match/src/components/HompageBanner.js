import Image from "next/image";

const HomepageBanner = ({text, image, bgColor, textColor, imageAlign}) => {
    return (
        <span className={`flex justify-between items-center p-4 shadow-md ${bgColor}`}>
            {imageAlign === "left" && (
                <div className="w-1/2 place-items-center">
                    <Image src={image} height={300} alt="Banner Image" />
                </div>
            )}
            <div className={`w-1/2 text-center text-4xl font-bold ${textColor} px-8 py-2 rounded-md`}>
                {text}
            </div>
            {imageAlign === "right" && (
                <div className="w-1/2 place-items-center">
                    <Image src={image} height={300} alt="Banner Image" />
                </div>
            )}
        </span>
    );
};

export default HomepageBanner;