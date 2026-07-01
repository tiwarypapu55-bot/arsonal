import React, { useState } from 'react';
import { 
  PackageCheck, PackageX, Truck, RefreshCcw, AlertTriangle, 
  Search, Factory, ChevronRight, MapPin, ClipboardList,
  BarChart3, PieChart as PieChartIcon, History, Zap, CheckCircle2,
  Box, Boxes, ArrowUpRight, X, Printer, QrCode, ShieldCheck, Tag, Loader2
} from 'lucide-react';
import { useERPData } from '../hooks/useERPData';
import { cn } from '../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

export const FinishedGoods: React.FC = () => {
  const { data, loading, refetch } = useERPData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('All');

  // Interactive console status
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [actionStatus, setActionStatus] = useState<string>('');
  const [actionWarehouse, setActionWarehouse] = useState<string>('');
  const [actionRack, setActionRack] = useState<string>('');
  const [actionBatch, setActionBatch] = useState<string>('');
  
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string>('');

  // Thermal Decal Label printing simulator state
  const [printState, setPrintState] = useState<'idle' | 'spooling' | 'routing' | 'printed'>('idle');

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Zap className="animate-spin text-pink-500 mr-3" />
      <span className="font-black text-xs uppercase tracking-widest text-slate-400">Syncing with Finished Goods Vector...</span>
    </div>
  );

  const finishedGoods = data?.finishedGoods || [];
  const history = data?.productionHistory || [];

  const stats = {
    ready: finishedGoods.filter((i: any) => i.status === 'READY').length,
    hold: finishedGoods.filter((i: any) => i.status === 'HOLD').length,
    damaged: finishedGoods.filter((i: any) => i.status === 'DAMAGED').length,
    returned: finishedGoods.filter((i: any) => i.status === 'RETURNED').length,
    dispatchReady: finishedGoods.filter((i: any) => i.status === 'DISPATCH_READY').length,
  };

  const warehouseStats = (data?.warehouses || []).map((w: string) => ({
    name: w,
    qty: finishedGoods.filter((i: any) => i.warehouse === w).length
  }));

  const productStats = (data?.products || []).map((p: any) => ({
    name: p.name,
    qty: finishedGoods.filter((i: any) => i.model === p.id).length
  }));

  const COLORS = ['#06b6d4', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'];

  const filteredGoods = finishedGoods.filter((item: any) => {
    const matchesSearch = item.serial.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse = selectedWarehouse === 'All' || item.warehouse === selectedWarehouse;
    return matchesSearch && matchesWarehouse;
  });

  const handleOpenItem = (item: any) => {
    setSelectedItem(item);
    setActionStatus(item.status);
    setActionWarehouse(item.warehouse);
    setActionRack(item.rack || '');
    setActionBatch(item.batch || '');
    setPrintState('idle');
  };

  const handleUpdateFinishedGood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmittingAction(true);
    try {
      const response = await fetch(`/api/finishedGoods/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionStatus,
          warehouse: actionWarehouse,
          rack: actionRack,
          batch: actionBatch
        })
      });
      if (response.ok) {
        setSuccessToast(`SUCCESSFULLY REGISTERED CHANGES FOR ${selectedItem.serial}!`);
        setTimeout(() => setSuccessToast(''), 4000);
        await refetch();
        setSelectedItem(null);
      }
    } catch (err) {
      console.error('[Finished Goods Console Dispatch Error]:', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Simulated Label printing queue
  const handleSimulatePrint = () => {
    setPrintState('spooling');
    setTimeout(() => {
      setPrintState('routing');
      setTimeout(() => {
        setPrintState('printed');
        // Auto reset spooled states back to idle after a duration
        setTimeout(() => setPrintState('idle'), 5000);
      }, 1500);
    }, 1200);
  };

  // Find linked warranty history if sold or active
  const linkedWarranty = data?.warranty?.find((w: any) => w.serial === selectedItem?.serial);

  return (
    <div className="space-y-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111827] text-white py-4 px-6 rounded-2xl shadow-2xl border border-[#0c9bbc]/30 flex items-center gap-3 animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <p className="text-[10px] font-black tracking-widest uppercase text-emerald-400 font-mono">{successToast}</p>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Boxes size={120} />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Finished Goods Intelligence</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1 flex items-center">
             <Zap size={14} className="mr-2 text-[#0c9bbc] shadow-[0_0_8px_rgba(0,0,0,0.1)]" /> End-of-Line Audit & Logistics Dispatch Matrix
          </p>
        </div>

        <div className="flex flex-wrap gap-3 relative z-10">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary-600 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="SCAN SERIAL / SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 text-slate-900 pl-12 pr-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-primary-500 outline-none w-64 transition-all shadow-xl shadow-slate-200/50"
            />
          </div>
          <select 
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="bg-white border border-slate-200 text-slate-900 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-primary-500 outline-none transition-all shadow-xl shadow-slate-200/50 cursor-pointer appearance-none"
          >
            <option value="All">All Warehouses</option>
            {data?.warehouses.map((w: string) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Stats Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {[
          { label: 'Ready Stock', value: stats.ready, icon: PackageCheck, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Hold Stock', value: stats.hold, icon: ClipboardList, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Damaged', value: stats.damaged, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'Returned', value: stats.returned, icon: RefreshCcw, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Dispatch Ready', value: stats.dispatchReady, icon: Truck, color: 'text-violet-500', bg: 'bg-violet-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 sm:p-5 lg:p-4 xl:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 hover:border-primary-200 transition-all group relative overflow-hidden shadow-xl shadow-slate-200/50 min-w-0">
             <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-all duration-700 pointer-events-none">
                <stat.icon size={100} />
             </div>
             <div className="flex justify-between items-start mb-6">
                <div className={cn("p-3 rounded-2xl mb-4 shadow-inner", stat.bg, stat.color)}>
                  <stat.icon size={20} />
                </div>
                <ArrowUpRight size={16} className="text-slate-300 group-hover:text-primary-600 transition-colors" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 truncate" title={stat.label}>{stat.label}</p>
             <p className="text-2xl sm:text-3xl lg:text-xl xl:text-3xl 2xl:text-4xl font-black text-slate-900 italic tracking-tighter truncate" title={stat.value.toString()}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Warehouse Wise Stock Bar Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
             <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                   <MapPin size={20} />
                </div>
                <div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-sans">Warehouse Node Distribution</h3>
                   <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Geospatial Stock Allocation</p>
                </div>
             </div>
             <PieChartIcon size={16} className="text-slate-300" />
          </div>
          
          <div className="h-[300px] w-full font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={8} 
                  fontWeight={900} 
                  tickFormatter={(val) => val.toUpperCase()} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={8} fontWeight={900} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', fontSize: '10px', color: '#0f172a', fontWeight: 900 }}
                  itemStyle={{ color: '#0c9bbc' }}
                />
                <Bar dataKey="qty" fill="#009cbc" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Model Wise Mix */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
             <div className="flex items-center space-x-4">
                <div className="p-3 bg-pink-50 text-pink-600 rounded-xl">
                   <PieChartIcon size={20} />
                </div>
                <div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-sans">Product Inventory Mix</h3>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ready Stock Composition</p>
                </div>
             </div>
          </div>

          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="qty"
                >
                  {productStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', fontSize: '10px', fontWeight: 900 }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Inventory Board */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
        <div className="bg-slate-50 p-8 flex justify-between items-center border-b border-slate-100">
           <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-50 text-[#0c9bbc] rounded-xl shadow-inner">
                 <Boxes size={20} />
              </div>
              <div>
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic leading-none">Advanced Ready Stock Matrix</h3>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Real-time Artifact Monitoring (Click row to open Control Center)</p>
              </div>
           </div>
           <div className="flex items-center space-x-4">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Export Options</span>
              <button className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary-600 transition-all shadow-sm">
                 <ArrowUpRight size={16} />
              </button>
           </div>
        </div>
        
        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
              <tr>
                <th className="px-8 py-6">Unique Serial ID</th>
                <th className="px-8 py-6">Product Cluster</th>
                <th className="px-8 py-6">Warehouse Hub</th>
                <th className="px-8 py-6">Production Batch</th>
                <th className="px-8 py-6">Verification Link</th>
                <th className="px-8 py-6 text-right font-sans">Operational Status / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGoods.map((item: any) => (
                <tr 
                  key={item.id} 
                  onClick={() => handleOpenItem(item)}
                  className="group hover:bg-slate-100/90 transition-all duration-300 cursor-pointer"
                >
                  <td className="px-8 py-6">
                    <p className="text-[12px] font-black text-slate-900 tracking-widest group-hover:text-[#0c9bbc] transition-colors uppercase">{item.serial}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase italic tracking-wider">Entry: {item.date}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">{item.model}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase leading-none opacity-60">
                      {data?.products.find((p:any) => p.id === item.model)?.name || "ArcPower Storage Matrix"}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center text-[11px] font-black text-slate-700 uppercase tracking-widest">
                       <MapPin size={12} className="mr-2 text-[#0c9bbc]" /> {item.warehouse}
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase italic ml-5">Rack: {item.rack || "A-Floor"}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[11px] font-black text-slate-900 italic uppercase">{item.batch}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                       <div className="h-full bg-emerald-500 w-[92%] shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                    </div>
                    <span className="text-[8px] font-black text-slate-400 mt-2 block tracking-widest uppercase">QC CERTIFIED</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className={cn(
                        "inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shadow-sm border",
                        item.status === 'READY' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        item.status === 'HOLD' ? "bg-amber-50 text-amber-750 border-amber-100" :
                        item.status === 'DAMAGED' ? "bg-rose-50 text-rose-700 border-rose-100 animate-pulse" :
                        item.status === 'RETURNED' ? "bg-sky-50 text-sky-700 border-sky-100" :
                        item.status === 'DISPATCH_READY' ? "bg-violet-50 text-violet-750 border-violet-100 shadow-[0_0_10px_rgba(139,92,246,0.1)]" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      )}>
                        {item.status.replace('_', ' ')}
                      </span>
                      <button className="opacity-0 group-hover:opacity-100 px-3.5 py-2 bg-[#0c9bbc] hover:bg-[#008ba3] text-white text-[9.5px] font-black uppercase tracking-wider rounded-lg transition-all active:scale-95 flex items-center gap-1 shrink-0 font-sans cursor-pointer">
                         <QrCode size={12} /> Control
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production History & Batch Analysis */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl relative shadow-slate-200/50">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50/50">
           <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-50 text-[#0c9bbc] rounded-xl shadow-inner">
                 <History size={20} />
              </div>
              <div>
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic leading-none">Production Execution Log</h3>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Batch-Wise Transformation Analytics</p>
              </div>
           </div>
           
           <div className="flex items-center space-x-8">
              <div className="text-center font-mono">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Batches</p>
                 <p className="text-2xl font-black text-slate-900 italic tracking-tighter">{history.length}</p>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div className="text-center font-mono animate-pulse">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Yield Efficiency</p>
                 <p className="text-2xl font-black text-[#0c9bbc] italic tracking-tighter">98.4%</p>
              </div>
           </div>
        </div>

        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left">
            <thead className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-slate-50">
              <tr>
                <th className="px-8 py-6">Completion Hub</th>
                <th className="px-8 py-6">Artifact Model</th>
                <th className="px-8 py-6">Output Vector</th>
                <th className="px-8 py-6">Batch ID Artifact</th>
                <th className="px-8 py-6 text-right">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((h: any) => (
                <tr key={h.id} className="hover:bg-slate-50 transition-all duration-300">
                  <td className="px-8 py-6">
                    <p className="text-[11px] font-black text-slate-900 italic tracking-widest uppercase">{h.date}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-tight">Unit-Alpha-01</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[12px] font-black text-primary-600 uppercase tracking-widest leading-none">{h.model}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase truncate max-w-[200px] opacity-60">
                      {data?.products.find((p:any) => p.id === h.model)?.name || "ArcPower Matrix Spec"}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3 text-slate-900">
                       <p className="text-xl font-black italic tracking-tighter">{h.qty}</p>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">UNITS</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-mono text-slate-500 font-black shadow-inner">{h.id}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="inline-flex items-center text-primary-600 text-[10px] font-black uppercase tracking-widest bg-primary-50 px-4 py-1.5 rounded-full border border-primary-100 shadow-sm">
                       <CheckCircle2 size={14} className="mr-2" /> {h.status}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {/* ==================== FULL-SCREEN FINISHED GOODS MANAGEMENT PORTAL ==================== */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-[#f8fafc] flex flex-col h-full w-full select-none overflow-y-auto" id="finished-goods-drawer">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 flex flex-col justify-between min-h-screen">
             
             {/* Dynamic Console Wrapper */}
             <div className="bg-white w-full shadow-2xl border border-slate-200/90 rounded-[2.5rem] p-6 sm:p-10 md:p-12 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-10">
                
                {/* Section header */}
                <div className="flex justify-between items-start pb-6 border-b-2 border-slate-100">
                   <div className="text-left">
                      <span className="text-[10px] font-black uppercase text-[#0c9bbc] tracking-widest block mb-2 leading-none">FINISHED GOODS INTELLIGENCE CENTRE</span>
                      <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">{selectedItem.serial}</h1>
                      <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
                         MODEL TYPE: <span className="font-black text-slate-700">{selectedItem.model}</span> • INITIALIZED ON {selectedItem.date}
                      </p>
                   </div>
                   <button 
                     type="button"
                     onClick={() => setSelectedItem(null)}
                     className="p-3.5 text-slate-450 bg-white border border-slate-200 hover:text-slate-900 hover:border-slate-350 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm active:scale-95 shrink-0"
                     title="Close Console"
                   >
                     <X size={20} />
                   </button>
                </div>

                {/* Primary Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 text-left">
                   
                   {/* COLUMN 1: Asset Configuration & Relocation (Span 7) */}
                   <form onSubmit={handleUpdateFinishedGood} className="lg:col-span-7 space-y-8">
                      {/* State status chooser */}
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-mono leading-none">OPERATIONAL LOGISTICS STATUS</label>
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                              { code: 'READY', label: 'READY FOR TRADING', bg: 'hover:bg-emerald-50/50' },
                              { code: 'HOLD', label: 'QC HOLD STOCK', bg: 'hover:bg-amber-50/50' },
                              { code: 'DAMAGED', label: 'DAMAGED / INOPERATIVE', bg: 'hover:bg-rose-50/50' },
                              { code: 'RETURNED', label: 'CUSTOMER RETURNED', bg: 'hover:bg-sky-50/50' },
                              { code: 'DISPATCH_READY', label: 'DISPATCH STAGED', bg: 'hover:bg-violet-50/50' },
                              { code: 'SOLD', label: 'COMMERCIALLY SOLD', bg: 'hover:bg-slate-100/50' },
                            ].map(st => (
                              <button
                                key={st.code}
                                type="button"
                                onClick={() => setActionStatus(st.code)}
                                className={cn(
                                  "p-4 rounded-xl border text-[10px] font-black uppercase tracking-wider text-center transition-all active:scale-[0.97] cursor-pointer shadow-xs leading-snug",
                                  actionStatus === st.code
                                    ? st.code === 'READY' ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-extrabold shadow-md" :
                                      st.code === 'HOLD' ? "bg-amber-50 border-amber-500 text-amber-700 font-extrabold shadow-md" :
                                      st.code === 'DAMAGED' ? "bg-rose-50 border-rose-500 text-rose-700 font-extrabold shadow-md" :
                                      st.code === 'RETURNED' ? "bg-sky-50 border-sky-550 text-sky-700 font-extrabold shadow-md" :
                                      st.code === 'DISPATCH_READY' ? "bg-violet-50 border-violet-500 text-violet-750 font-extrabold shadow-md" :
                                      "bg-slate-150 border-slate-600 text-slate-800 font-extrabold shadow-sm"
                                    : "bg-white border-slate-200 text-slate-500 " + st.bg
                                )}
                              >
                                 {st.label}
                              </button>
                            ))}
                         </div>
                      </div>

                      {/* Moving Coordinates & Identity */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-mono leading-none">WAREHOUSE HUBS</label>
                            <div className="relative">
                               <select
                                 value={actionWarehouse}
                                 onChange={e => setActionWarehouse(e.target.value)}
                                 className="w-full bg-[#f8fafc] border border-slate-200 rounded-2xl py-4 px-4 pr-10 text-xs font-black text-slate-800 uppercase appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-[#0c9bbc]/20 transition-all shadow-sm"
                               >
                                 {data?.warehouses.map((wh: string) => (
                                   <option key={wh} value={wh}>{wh}</option>
                                 ))}
                               </select>
                               <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">
                                 ▼
                               </div>
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-mono leading-none">RACK BIN LOCATION</label>
                            <input
                              type="text"
                              value={actionRack}
                              onChange={e => setActionRack(e.target.value)}
                              className="w-full bg-[#f8fafc] border border-slate-200 rounded-2xl py-4 px-4 text-xs font-black text-slate-850 uppercase outline-none focus:ring-2 focus:ring-[#0c9bbc]/20 transition-all shadow-sm font-mono"
                              placeholder="E.g., RA-12"
                              required
                            />
                         </div>
                      </div>

                      {/* Batch Identity Customizing */}
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block font-mono leading-none">BATCH PRODUCTION ASSIGNMENT</label>
                         <input
                           type="text"
                           value={actionBatch}
                           onChange={e => setActionBatch(e.target.value)}
                           className="w-full bg-[#f8fafc] border border-slate-200 rounded-2xl py-4 px-4 text-xs font-black text-slate-850 uppercase outline-none focus:ring-2 focus:ring-[#0c9bbc]/20 transition-all shadow-sm font-mono"
                           placeholder="E.g., BATCH-24"
                           required
                         />
                      </div>

                      {/* Associated Warranty Status System */}
                      <div className="p-5 border border-slate-150 rounded-[1.5rem] bg-slate-50/50 space-y-4">
                         <div className="flex items-center gap-2">
                           <ShieldCheck className="text-[#0c9bbc]" size={18} />
                           <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider font-mono">Warranty Registry Handshake</span>
                         </div>
                         
                         {linkedWarranty ? (
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
                             <div>
                               <span className="text-[9px] text-slate-400 block font-bold uppercase">WARRANTY STATUS</span>
                               <span className={cn(
                                 "font-black tracking-widest text-[10px] uppercase",
                                 linkedWarranty.status === 'ACTIVE' ? "text-emerald-600" : "text-amber-600"
                               )}>{linkedWarranty.status}</span>
                             </div>
                             <div>
                               <span className="text-[9px] text-slate-400 block font-bold uppercase">LAUNCH DATE</span>
                               <span className="font-extrabold text-slate-800">{linkedWarranty.startDate}</span>
                             </div>
                             <div>
                               <span className="text-[9px] text-slate-400 block font-bold uppercase">RECOVERABLE DURATION</span>
                               <span className="font-extrabold text-slate-800">{linkedWarranty.durationMonths} MONTHS</span>
                             </div>
                           </div>
                         ) : (
                           <p className="text-[10px] font-bold text-slate-400 italic leading-relaxed">
                             No explicit retail warranty records. Unit is fully stored under wholesale ready stock. Warranty handshakes register upon billing invoices inside Gujarat / Gandhinagar networks.
                           </p>
                         )}
                      </div>

                      {/* Submit actions */}
                      <div className="pt-6 border-t border-slate-100 flex gap-4">
                         <button
                           type="button"
                           onClick={() => setSelectedItem(null)}
                           className="flex-1 py-4 border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 rounded-2xl font-black text-[10.5px] uppercase tracking-widest text-slate-505 transition-all cursor-pointer active:scale-95 leading-none shadow-xs"
                         >
                            Discard
                         </button>
                         <button
                           type="submit"
                           disabled={submittingAction}
                           className="flex-1 py-4 bg-[#0c9bbc] hover:bg-[#008ba3] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#0c9bbc]/15 active:scale-95 disabled:opacity-50 leading-none"
                         >
                            {submittingAction ? <Loader2 className="animate-spin" size={14} /> : "✓ REGISTER CHANGES"}
                         </button>
                      </div>
                   </form>

                   {/* COLUMN 2: Thermal Decal Sticker & Barcode Machine (Span 5) */}
                   <div className="lg:col-span-5 flex flex-col items-center gap-6 bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-150">
                      <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider block font-mono leading-none text-center self-start">
                         THERMAL LABEL PRINTER MATRIX
                      </span>

                      {/* Sticker Container */}
                      <div className="w-full bg-white text-slate-900 p-6 rounded-2xl border-4 border-dashed border-slate-300 shadow-lg relative font-mono text-[11px] select-text">
                         {/* Dashed cut lines help styling */}
                         <div className="absolute top-2 right-2 border border-slate-950 px-2 py-0.5 text-[8px] font-black uppercase rounded-sm">
                            PASSED
                         </div>

                         <div className="text-center pb-4 border-b border-slate-950">
                            <h4 className="text-sm font-black tracking-widest uppercase">ARCENOL POWER DECAL</h4>
                            <p className="text-[7.5px] text-slate-505 uppercase tracking-widest mt-1">BATTERY DIVISION • GUJARAT STATE INVENTORY</p>
                         </div>

                         <div className="space-y-2 py-4 border-b border-slate-350">
                            <div className="flex justify-between">
                               <span>SERIAL ID:</span>
                               <span className="font-extrabold uppercase">{selectedItem.serial}</span>
                            </div>
                            <div className="flex justify-between">
                               <span>SKU BATCH:</span>
                               <span className="font-extrabold uppercase">{actionBatch || selectedItem.batch}</span>
                            </div>
                            <div className="flex justify-between">
                               <span>MODEL NO:</span>
                               <span className="font-extrabold uppercase">{selectedItem.model}</span>
                            </div>
                            <div className="flex justify-between">
                               <span>RACK ASSIGN:</span>
                               <span className="font-extrabold uppercase">{actionRack.toUpperCase() || "A-FLOOR"}</span>
                            </div>
                            <div className="flex justify-between">
                               <span>DATE GEN:</span>
                               <span className="font-extrabold uppercase">{selectedItem.date}</span>
                            </div>
                         </div>

                         <div className="flex flex-col items-center justify-center pt-4 gap-3">
                            <div className="w-36 h-10 bg-slate-950 flex items-center justify-center rounded p-1 group">
                               {/* Stylized Barcode SVG vector */}
                               <div className="w-full h-full flex justify-between">
                                  {[3,1,2,4,1,3,2,1,4,2,3,1,4,1,2,3,1,4,2,1,3,4,1].map((bar, idx) => (
                                    <div 
                                      key={idx} 
                                      style={{ width: `${bar * 1.5}px` }} 
                                      className="h-full bg-white shrink-0" 
                                    />
                                  ))}
                               </div>
                            </div>
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">
                               ★ SECURITY BLOCKCHAIN HANDSHAKE APPROVED ★
                            </span>
                         </div>
                      </div>

                      {/* Printer Controls */}
                      <div className="w-full space-y-4">
                         <button
                           type="button"
                           onClick={handleSimulatePrint}
                           disabled={printState !== 'idle'}
                           className={cn(
                             "w-full py-4 text-[10.5px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer",
                             printState === 'idle' ? "bg-slate-900 border-2 border-slate-900 hover:bg-slate-800 text-white" :
                             printState === 'spooling' ? "bg-amber-500 text-white border-2 border-amber-500" :
                             printState === 'routing' ? "bg-[#0c9bbc] text-white border-2 border-[#0c9bbc]" :
                             "bg-emerald-600 text-white border-2 border-emerald-600"
                           )}
                         >
                            {printState === 'idle' && (
                              <>
                                <Printer size={15} /> SIMULATE PRINT LABEL
                              </>
                            )}
                            {printState === 'spooling' && (
                              <>
                                <Loader2 className="animate-spin" size={15} /> SPOOLING FILE SYSTEM...
                              </>
                            )}
                            {printState === 'routing' && (
                              <>
                                <Loader2 className="animate-spin" size={15} /> ROUTING DECALS TO GUJARAT...
                              </>
                            )}
                            {printState === 'printed' && (
                              <>
                                <CheckCircle2 size={15} /> ROUTED SUCCESSFULLY!
                              </>
                            )}
                         </button>

                         {/* Mini status telemetry display on label tool */}
                         <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-1.5 text-left text-[9px] font-mono">
                            <div className="flex justify-between text-slate-400">
                               <span>PRINTER HARDWARE STATUS:</span>
                               <span className="text-emerald-600 font-extrabold uppercase">● ONLINE</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                               <span>LAST ASSIGNED SPOOL:</span>
                               <span className="text-slate-800 font-extrabold uppercase">{selectedItem.serial || "N/A"}</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                               <span>SPOOL ROUTING DESTINATION:</span>
                               <span className="text-slate-800 font-extrabold uppercase">Gandhinagar Casing Team</span>
                            </div>
                         </div>
                      </div>
                   </div>

                </div>

             </div>

             {/* Simple Engine Metadata Footer */}
             <div className="text-[8.5px] font-mono font-black text-slate-400 text-center uppercase tracking-widest select-none mt-8">
                Arcenol Logistics Engine - Signed action
             </div>
          </div>
        </div>
      )}

    </div>
  );
};
