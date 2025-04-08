const CustomButton = ({ children, className }) => {
    return (
      <button className={`px-4 py-2 rounded-md font-semibold ${className}`}>
        {children}
      </button>
    );
  };

export default CustomButton;