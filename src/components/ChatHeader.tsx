import logo from "@/assets/logo.png";
const ChatHeader = () => {
  return <div className="chat-gradient-header px-6 py-4 sticky top-0 z-50 bg-slate-500">
      <div className="flex items-center justify-between max-w-4xl mx-auto px-[28px] bg-slate-200 my-[4px] py-[4px] rounded-lg">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="ICT.com.mm" className="h-10 w-auto object-contain" />
          <div className="text-white">
            <h1 className="text-xl font-semibold"></h1>
            <p className="text-sm text-white/80">
          </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-slate-600">Online</span>
        </div>
      </div>
    </div>;
};
export default ChatHeader;