import logoEpic from "@/LOGOEPIC.png";
import LivingNebulaShader from "./effects/LivingNebulaShader";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass overflow-hidden">
      <LivingNebulaShader />
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex items-center">
          <div className="flex items-center space-x-2 py-4">
            <img src={logoEpic} alt="Epic Logo" className="h-10 w-10 drop-shadow-sm" />
            <span className="font-bold text-2xl text-foreground text-shadow ethnocentric-header">
              Epic Board
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;