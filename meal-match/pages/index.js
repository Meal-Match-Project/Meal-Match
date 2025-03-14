import HomepageBanner from "../src/app/components/HompageBanner";
import banner1 from "../public/mixnmatch1.jpg";
import banner2 from "../public/mixnmatch2.jpg";
import Navbar from "../src/app/components/Navbar";


export default function Home() {
  return (
    <>
    <Navbar />
    <HomepageBanner text="Meal prep revolutionized." image={banner1} bgColor="bg-orange-400" textColor="text-white" imageAlign="right"></HomepageBanner>
    <HomepageBanner text="Mix and match components." image={banner2} bgColor="bg-stone-200" textColor="text-black" imageAlign="left"></HomepageBanner>
    </>
  );
}
