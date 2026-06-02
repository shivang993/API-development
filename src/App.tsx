import React, { useState, useEffect } from "react";
import { 
  useNavigate, 
  Routes, 
  Route, 
  Link, 
  useLocation, 
  BrowserRouter 
} from "react-router-dom";
import { 
  MapPin, Users, Home, Info, Cpu, X, Star, BarChart3, 
  ShieldCheck, LayoutDashboard, Key, FileText, Settings, 
  Menu, Bell, Search, Activity, ChevronRight, Download,
  UserPlus, CheckCircle2, AlertCircle, Globe, History, Activity as Pulse
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area 
} from "recharts";
import { create } from "zustand";

// --- STATE MANAGEMENT ---
interface AppState {
  role: "admin" | "user" | "guest";
  setRole: (role: "admin" | "user" | "guest") => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const useStore = create<AppState>((set) => ({
  role: "admin",
  setRole: (role) => set({ role }),
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));

// --- COMPONENTS ---

const Breadcrumbs = () => {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(p => p);
  
  return (
    <div className="flex items-center gap-2 mb-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
      <Link to="/" className="hover:text-blue-600">Home</Link>
      {paths.map((p, i) => (
        <React.Fragment key={p}>
          <ChevronRight className="w-3 h-3" />
          <span className={i === paths.length - 1 ? "text-gray-900" : ""}>{p}</span>
        </React.Fragment>
      ))}
    </div>
  );
};

const StatCard = ({ title, value, change, icon, iconBg }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
    <div className="flex justify-between items-start mb-4">
      <div className={`${iconBg} p-2.5 rounded-xl text-white shadow-sm`}>{icon}</div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${change >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
        {change >= 0 ? "+" : ""}{change}%
      </span>
    </div>
    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">{title}</div>
    <div className="text-2xl font-heading font-bold text-gray-900 tracking-tight">{value}</div>
  </div>
);

// --- VIEWS ---

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/analytics").then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div className="p-20 text-center animate-pulse">Initializing Central Analytics...</div>;

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total API Requests" value="1.2M" change={12.5} icon={<Activity className="w-5 h-5"/>} iconBg="bg-blue-600" />
        <StatCard title="Active Developers" value="4,821" change={8.2} icon={<Users className="w-5 h-5"/>} iconBg="bg-purple-600" />
        <StatCard title="System Uptime" value="99.98%" change={0.01} icon={<ShieldCheck className="w-5 h-5"/>} iconBg="bg-green-600" />
        <StatCard title="Average Latency" value="42ms" change={-15} icon={<Pulse className="w-5 h-5"/>} iconBg="bg-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-8 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" /> Request Distribution (30 Days)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.requestsByDay}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip 
                  contentStyle={{ border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  cursor={{ stroke: '#2563EB', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-8">System Response (p95 vs p99)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.responseTimeTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="p95" stroke="#2563EB" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="p99" stroke="#E11D48" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm lg:col-span-1">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-8">Plan Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data.userDistribution} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {data.userDistribution.map((entry: any, index: any) => (
                    <Cell key={`cell-${index}`} fill={['#2563EB', '#7C3AED', '#DB2777', '#EA580C'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {data.userDistribution.map((d: any, i: any) => (
              <div key={d.name} className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{d.name}</span>
                <span className="text-sm font-bold text-gray-900">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-8 px-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" /> Usage by State (Top 5)
          </h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stateUsage} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600 }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" /> Pending B2B Approvals
          </h3>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Action Required (2)</span>
        </div>
        <div className="divide-y divide-gray-50">
          <PendingUser initials="ZT" name="Zomato Logistics" email="verification@zomato.com" plan="PRO" />
          <PendingUser initials="FK" name="Flipkart Supply" email="api-dev@flipkart.com" plan="UNLIMITED" color="bg-green-100 text-green-600" />
        </div>
      </div>
    </div>
  );
};

const PendingUser = ({ initials, name, email, plan, color = "bg-orange-100 text-orange-600" }: any) => (
  <div className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${color}`}>{initials}</div>
      <div>
        <div className="font-bold text-gray-900 leading-none">{name}</div>
        <div className="text-[10px] text-gray-400 font-medium mt-1">{email} • Plan: {plan}</div>
      </div>
    </div>
    <div className="flex gap-2">
      <button className="px-4 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold hover:bg-white">Reject</button>
      <button className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold shadow-md shadow-blue-100">Approve Access</button>
    </div>
  </div>
);

const B2BPortal = () => {
  const [keys, setKeys] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/user/keys").then(r => r.json()).then(setKeys);
  }, []);

  return (
    <div className="space-y-8 max-w-5xl">
      <section className="bg-blue-600 rounded-3xl p-10 text-white shadow-xl relative overflow-hidden">
        <Globe className="absolute -bottom-10 -right-10 w-64 h-64 opacity-10" />
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-heading font-bold mb-4">Welcome back, Enterprise Tech.</h2>
          <p className="text-blue-100 mb-8 leading-relaxed opacity-90">
            Your integration is currently syncing with version 1.4 of the Village Master DB. 
            Estimated next data harvest: April 30, 2026.
          </p>
          <div className="flex gap-4">
            <button className="bg-white text-blue-600 px-6 py-2.5 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Last Month Reports
            </button>
            <button className="bg-blue-700/50 backdrop-blur-md text-white px-6 py-2.5 rounded-full font-bold text-sm border border-blue-500/30 hover:bg-blue-700 transition-colors">
              Refresh Plan
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-gray-900 uppercase tracking-widest text-[11px] flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" /> Active API Access Keys
            </h3>
            <button className="text-xs font-bold text-blue-600 hover:underline">+ Generate Key</button>
          </div>
          <div className="space-y-4">
            {keys.map((k: any) => (
              <div key={k.id} className="p-5 border border-gray-50 rounded-2xl bg-gray-50/50 flex justify-between items-center group transition-all hover:border-blue-100">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{k.name}</div>
                  <div className="font-mono text-[11px] text-gray-400 mt-1">{k.key}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> {k.status}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono italic">Issued {k.created}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 uppercase tracking-widest text-[11px] mb-8 flex items-center gap-2">
            <History className="w-4 h-4 text-orange-600" /> Recent Request Stream
          </h3>
          <div className="space-y-6">
            <LogItem endpoint="/v1/autocomplete" time="2s ago" status={200} />
            <LogItem endpoint="/v1/search" time="15m ago" status={200} />
            <LogItem endpoint="/v1/states/st_1/districts" time="1h ago" status={200} />
            <LogItem endpoint="/v1/search/error" time="2h ago" status={401} />
          </div>
        </div>
      </div>
    </div>
  );
};

const LogItem = ({ endpoint, time, status }: any) => (
  <div className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
    <div className="flex gap-4 items-center">
      <div className={`w-2 h-2 rounded-full ${status === 200 ? "bg-green-400" : "bg-red-400"}`}></div>
      <div>
        <div className="font-mono text-xs text-gray-700">{endpoint}</div>
        <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{time}</div>
      </div>
    </div>
    <div className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${status === 200 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
      {status}
    </div>
  </div>
);

// --- MAIN LAYOUT ---

export default function App() {
  const { isSidebarOpen, role, toggleSidebar } = useStore();
  
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8FAFC] flex text-gray-900 font-sans">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? "w-72" : "w-20"} bg-white border-r border-gray-100 flex flex-col transition-all duration-300 relative z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}>
          <div className="p-8 border-b border-gray-50 flex items-center gap-4">
            <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
              <MapPin className="text-white w-6 h-6" />
            </div>
            {isSidebarOpen && (
              <div className="font-heading font-extrabold text-xl tracking-tight leading-none">
                Village<span className="text-blue-600">Connect</span>
              </div>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <SidebarItem to="/admin" icon={<LayoutDashboard />} label="Admin Console" isOpen={isSidebarOpen} activeOn="/admin" />
            <SidebarItem to="/portal" icon={<Globe />} label="B2B Portal" isOpen={isSidebarOpen} activeOn="/portal" />
            <SidebarItem to="/demo" icon={<Activity />} label="Demo Client" isOpen={isSidebarOpen} activeOn="/demo" />
            <div className="pt-6 pb-2 px-4 uppercase text-[10px] font-bold tracking-widest text-gray-300">Operations</div>
            <SidebarItem to="/villages" icon={<Search />} label="Data Browser" isOpen={isSidebarOpen} activeOn="/villages" />
            <SidebarItem to="/api-keys" icon={<Key />} label="Keys & Access" isOpen={isSidebarOpen} activeOn="/api-keys" />
            <SidebarItem to="/logs" icon={<History />} label="System Logs" isOpen={isSidebarOpen} activeOn="/logs" />
            <div className="pt-6 pb-2 px-4 uppercase text-[10px] font-bold tracking-widest text-gray-300">Resources</div>
            <SidebarItem to="/docs" icon={<FileText />} label="Documentation" isOpen={isSidebarOpen} activeOn="/docs" />
          </nav>

          <button onClick={toggleSidebar} className="absolute -right-3 top-24 bg-white border border-gray-100 p-1 rounded-md shadow-sm hover:translate-x-1 transition-transform">
            <ChevronRight className={`w-4 h-4 transition-transform ${isSidebarOpen ? "rotate-180" : ""}`} />
          </button>

          <div className="p-6 border-t border-gray-50">
            <div className={`flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer ${!isSidebarOpen && "justify-center"}`}>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">A</div>
              {isSidebarOpen && (
                <div className="overflow-hidden">
                  <div className="text-[11px] font-bold text-gray-900 truncate">Administrator</div>
                  <div className="text-[10px] font-medium text-gray-400 truncate tracking-tight">admin@villageapi.com</div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Bar */}
          <header className={`h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-10 flex items-center justify-between sticky top-0 bg-white z-40 transition-all`}>
            <h2 className="font-heading font-bold text-lg text-gray-800">
              Current Environment: <span className="text-blue-600">Production</span>
            </h2>
            <div className="flex items-center gap-6">
              <div className="bg-gray-50 rounded-full flex p-1 border border-gray-100">
                <button className="px-4 py-1 text-[10px] font-bold uppercase rounded-full bg-white shadow-sm text-gray-900">v1.4</button>
                <button className="px-4 py-1 text-[10px] font-bold uppercase text-gray-400">v2.0 Beta</button>
              </div>
              <div className="w-px h-6 bg-gray-100"></div>
              <button className="relative text-gray-400 hover:text-gray-900 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="bg-gray-900 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-lg shadow-gray-200 hover:-translate-y-0.5 transition-all">
                Submit Support Ticket
              </button>
            </div>
          </header>

          {/* Main Area */}
          <div className="flex-1 overflow-auto p-10 bg-[#F8FAFC]">
            <Breadcrumbs />
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/portal" element={<B2BPortal />} />
                <Route path="/villages" element={<VillageExplorer />} />
                <Route path="/demo" element={<DemoClient />} />
                <Route path="/docs" element={<Documentation />} />
                <Route path="/api-keys" element={<B2BPortal />} />
              </Routes>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

const Documentation = () => (
  <div className="max-w-4xl space-y-12">
    <section>
      <h2 className="text-3xl font-heading font-bold text-gray-900 mb-4">API Specifications</h2>
      <p className="text-gray-500 mb-8">Integrated V1 REST API for programmatic census exploration.</p>
      
      <div className="space-y-6">
        <ApiEndpoint 
          method="GET" 
          path="/search" 
          desc="Search villages with filters" 
          params={["q", "state", "district", "limit"]} 
        />
        <ApiEndpoint 
          method="GET" 
          path="/states" 
          desc="List all supported states" 
        />
        <ApiEndpoint 
          method="GET" 
          path="/autocomplete" 
          desc="Typeahead suggestions for address forms" 
          params={["q"]} 
        />
      </div>
    </section>

    <section className="bg-gray-900 rounded-3xl p-8 text-blue-300 font-mono text-xs overflow-x-auto shadow-xl">
      <div className="flex justify-between items-center mb-6 text-gray-500 uppercase tracking-widest font-bold">
        <span>Example Response Format</span>
        <span className="bg-blue-900/50 text-blue-400 px-2 py-1 rounded">application/json</span>
      </div>
      <pre className="leading-relaxed">
{`{
  "success": true,
  "count": 1,
  "data": [{
    "value": "vl_525002",
    "label": "Manibeli",
    "fullAddress": "Manibeli, Akkalkuwa, Nandurbar, Maharashtra, India",
    "hierarchy": {
      "village": "Manibeli",
      "subDistrict": "Akkalkuwa", 
      "district": "Nandurbar",
      "state": "Maharashtra"
    }
  }],
  "meta": {
    "requestId": "req_8dx2k",
    "responseTime": 42
  }
}`}
      </pre>
    </section>
  </div>
);

const ApiEndpoint = ({ method, path, desc, params }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-blue-200 transition-all">
    <div className="flex items-center gap-6">
      <span className={`px-3 py-1 rounded-md font-bold text-[10px] ${method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{method}</span>
      <div>
        <div className="font-mono text-sm text-gray-900">{path}</div>
        <div className="text-xs text-gray-400 mt-1">{desc}</div>
      </div>
    </div>
    {params && (
      <div className="flex gap-2">
        {params.map((p: any) => (
          <span key={p} className="px-2 py-0.5 bg-gray-50 text-gray-400 font-mono text-[9px] rounded border border-gray-100">?{p}</span>
        ))}
      </div>
    )}
  </div>
);

const DemoClient = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    village: "",
    state: "",
    district: "",
    subDistrict: ""
  });

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const r = await fetch(`/api/v1/autocomplete?q=${q}`, { headers: { 'x-api-key': 'demo' } });
    const d = await r.json();
    setSuggestions(d.data);
  };

  const selectVillage = (v: any) => {
    setFormData({
      village: v.hierarchy.village,
      state: v.hierarchy.state,
      district: v.hierarchy.district,
      subDistrict: v.hierarchy.subDistrict
    });
    setSuggestions([]);
    setQuery(v.label);
  };

  return (
    <div className="max-w-2xl bg-white p-10 rounded-[32px] border border-gray-100 shadow-xl">
      <div className="mb-10 text-center">
        <div className="inline-block px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">Demo Integration</div>
        <h2 className="text-3xl font-heading font-bold text-gray-900">B2B Address Verification</h2>
        <p className="text-gray-400 mt-2 text-sm">Experience real-time hierarchy mapping in your own forms.</p>
      </div>

      <form className="space-y-6" onSubmit={e => e.preventDefault()}>
        <div className="relative">
          <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2 tracking-widest">Village / Area Autocomplete</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input 
              type="text" 
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Start typing village name (e.g. Manibeli)" 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-12 py-4 text-sm focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
          
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 w-full bg-white border border-gray-100 mt-2 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                {suggestions.map((s: any) => (
                  <button 
                    key={s.value}
                    onClick={() => selectVillage(s)}
                    className="w-full px-6 py-4 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="font-bold text-gray-900 text-sm">{s.label}</div>
                    <div className="text-[10px] text-gray-400 font-medium">{s.fullAddress}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputReadOnly label="State" value={formData.state} />
          <InputReadOnly label="District" value={formData.district} />
        </div>
        <InputReadOnly label="Sub-District / Tehsil" value={formData.subDistrict} />

        <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition-all active:scale-95">
          Submit Standardized Record
        </button>
      </form>
    </div>
  );
};

const InputReadOnly = ({ label, value }: any) => (
  <div>
    <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2 tracking-widest">{label}</label>
    <input 
      type="text" 
      readOnly 
      value={value}
      placeholder="Auto-filled" 
      className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-gray-600 outline-none"
    />
  </div>
);

const VillageExplorer = () => {
  const [villages, setVillages] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/v1/search?q=", { headers: { 'x-api-key': 'demo' } })
      .then(r => r.json())
      .then(d => setVillages(d.data));
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
        <div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-1">Village Master List</h3>
          <p className="text-xs text-gray-400 font-medium">Exploring {villages.length} validated records from census 2011</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4 text-gray-400" /> Export CSV
          </button>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors">
            Audit Selection
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white border-b border-gray-50 uppercase text-[10px] font-bold tracking-widest text-gray-400">
              <th className="px-8 py-5">Census Code</th>
              <th className="px-8 py-5 text-gray-900">Village Name</th>
              <th className="px-8 py-5">Locality (District / State)</th>
              <th className="px-8 py-5 text-right">Population</th>
              <th className="px-8 py-5 text-right">Households</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {villages.map((v) => (
              <tr key={v.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-8 py-5 font-mono text-[11px] text-gray-400 tracking-tighter">#{v.censusCode}</td>
                <td className="px-8 py-5">
                  <div className="font-heading font-bold text-gray-900">{v.name}</div>
                  <div className="text-[10px] font-bold text-blue-600/60 uppercase mt-0.5 tracking-tight shrink-0">Official Source</div>
                </td>
                <td className="px-8 py-5">
                  <div className="text-[11px] font-bold text-gray-700">{v.district}</div>
                  <div className="text-[10px] text-gray-400 font-semibold uppercase">{v.state}</div>
                </td>
                <td className="px-8 py-5 font-mono text-xs tabular-nums text-gray-700 text-right">{v.population.toLocaleString()}</td>
                <td className="px-8 py-5 font-mono text-xs tabular-nums text-gray-700 text-right">{v.households.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function SidebarItem({ to, icon, label, isOpen, activeOn }: any) {
  const location = useLocation();
  const isActive = location.pathname === activeOn || (activeOn === "/" && location.pathname === "");
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group relative ${
        isActive 
          ? "bg-blue-50 text-blue-600" 
          : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <div className={`shrink-0 transition-transform ${isActive ? "scale-110" : ""}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      {isOpen && (
        <span className="font-bold text-[13px] whitespace-nowrap tracking-tight">{label}</span>
      )}
      {!isOpen && (
        <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-[100] whitespace-nowrap font-bold uppercase tracking-widest">
          {label}
        </div>
      )}
      {isActive && isOpen && (
        <motion.div layoutId="activePill" className="absolute right-3 w-1.5 h-1.5 bg-blue-600 rounded-full" />
      )}
    </Link>
  );
}
