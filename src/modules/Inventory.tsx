import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, Plus, ChevronRight, AlertTriangle, 
  ArrowUpRight, Download, History, BarChart3, Tag, Warehouse,
  Activity, ShieldCheck, Zap, Layers, Microscope, QrCode, Trash2,
  Database, Boxes, Thermometer, Beaker, TrendingUp, Calendar, MapPin, X,
  ClipboardList, ArrowRight, Printer, CheckCircle2, Sliders, RefreshCw, AlertCircle
} from 'lucide-react';
import { useERPData } from '../hooks/useERPData';
import { cn, formatCurrency } from '../lib/utils';
import { useAuthStore, UserRole } from '../store/authStore';
import { QRCodeSVG } from 'qrcode.react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';

export const Inventory: React.FC = () => {
  const { user } = useAuthStore();
  const { data, loading, refetch } = useERPData();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'raw' | 'graded' | 'wip' | 'mrp' | 'warehouse'>('dashboard');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [isSyncing, setIsSyncing] = useState(false);

  // Procurement Modal States
  const [isProcureModalOpen, setIsProcureModalOpen] = useState(false);
  const [procureType, setProcureType] = useState<'existing' | 'new'>('existing');
  const [selectedExistingId, setSelectedExistingId] = useState('');
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCategory, setNewCategory] = useState('Cells');
  const [qty, setQty] = useState<number>(0);
  const [unit, setUnit] = useState('Pcs');
  const [supplier, setSupplier] = useState('');
  const [warehouse, setWarehouse] = useState('Raw Hub');
  const [rack, setRack] = useState('A-1');
  const [price, setPrice] = useState<number>(0);
  const [grn, setGrn] = useState('');
  const [batch, setBatch] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cell Grading Form States
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [gradingParentId, setGradingParentId] = useState('RM-CELLS');
  const [cellSerial, setCellSerial] = useState('');
  const [cellVoltage, setCellVoltage] = useState(3.2);
  const [cellIR, setCellIR] = useState(7.5);
  const [cellCapacity, setCellCapacity] = useState(6000);
  const [cellCycleCount, setCellCycleCount] = useState(0);
  const [cellTemp, setCellTemp] = useState(24.5);
  const [qcEngineer, setQcEngineer] = useState(user?.name || 'Suresh P.');
  const [gradingSuccess, setGradingSuccess] = useState('');

  // Warehouse Transfer States
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferItem, setTransferItem] = useState<any>(null);
  const [transferQty, setTransferQty] = useState<number>(0);
  const [sourceWh, setSourceWh] = useState('');
  const [destWh, setDestWh] = useState('Production Warehouse');
  const [transferError, setTransferError] = useState('');

  // MRP Allocation Simulator States
  const [mrpProductModel, setMrpProductModel] = useState('');
  const [mrpQty, setMrpQty] = useState<number>(10);
  const [mrpResult, setMrpResult] = useState<any>(null);
  const [mrpLoading, setMrpLoading] = useState(false);
  const [mrpMessage, setMrpMessage] = useState('');

  // QR Label Preview State
  const [selectedQRItem, setSelectedQRItem] = useState<any>(null);

  const [subSearchProcure, setSubSearchProcure] = useState('');
  const [subSearchGrading, setSubSearchGrading] = useState('');

  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    if (data?.inventory && data.inventory.length > 0 && !selectedExistingId) {
      setSelectedExistingId(data.inventory[0].id);
    }
    if (data?.products && data.products.length > 0 && !mrpProductModel) {
      setMrpProductModel(data.products[0].id);
    }
  }, [data, selectedExistingId, mrpProductModel]);

  const handleAction = (actionName: string, callback: () => void | Promise<void>) => {
    if (isSyncing) return;
    setIsSyncing(true);
    setTimeout(async () => {
      await callback();
      setIsSyncing(false);
    }, 150);
  };

  const handleFetchMRP = async () => {
    if (!mrpProductModel || mrpQty <= 0) return;
    setMrpLoading(true);
    setMrpMessage('');
    try {
      const res = await fetch(`/api/mrp/calculate?modelId=${mrpProductModel}&qty=${mrpQty}`);
      if (res.ok) {
        const json = await res.json();
        setMrpResult(json);
      } else {
        setMrpMessage('Failed to calculate MRP requirements');
      }
    } catch (e) {
      setMrpMessage('Error reaching server for calculation');
    } finally {
      setMrpLoading(false);
    }
  };

  const handleExecuteProductionPlan = async (mode: 'RESERVE' | 'CONSUME') => {
    if (!mrpProductModel || mrpQty <= 0) return;
    setMrpLoading(true);
    try {
      const res = await fetch('/api/mrp/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: mrpProductModel, qty: mrpQty, mode })
      });
      const dataJson = await res.json();
      if (res.ok) {
        setMrpMessage(`Success: Created MRP Plan (${dataJson.id}) using ${mode} allocation.`);
        refetch();
        setMrpResult(null);
      } else {
        setMrpMessage(`Error: ${dataJson.message || dataJson.error}`);
      }
    } catch (err: any) {
      setMrpMessage('Production submission failed');
    } finally {
      setMrpLoading(false);
    }
  };

  const handleSubmitProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qty || qty <= 0) {
      setSubmitError('Please enter a valid quantity.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload: any = {
        qty,
        supplier: supplier || 'Arcenol Premium Vendor',
        batch: batch || `BAT-${Math.floor(100 + Math.random() * 900)}`,
        grn: grn || `GRN-${Math.floor(1000 + Math.random() * 9000).toString()}`,
        price: price || 150,
        warehouse,
        rack,
        unit
      };

      if (procureType === 'existing') {
        payload.existingItemId = selectedExistingId;
      } else {
        payload.name = newName;
        payload.code = newCode || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
        payload.category = newCategory;
      }

      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to submit inventory entry');
      }

      await refetch();
      setIsProcureModalOpen(false);
      setQty(0);
      setNewName('');
      setNewCode('');
      setSupplier('');
      setBatch('');
      setGrn('');
      setPrice(0);
    } catch (err: any) {
      setSubmitError(err.message || 'Error executing procurement REST transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCellGrading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellSerial.trim()) {
      setSubmitError('Serial reference is required');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');

    // Determine Grade based on technical limits
    let finalGrade = 'C';
    let usage = 'ESS / Storage Systems';
    if (cellVoltage >= 3.2 && cellIR <= 8.0 && cellCapacity >= 6000) {
      finalGrade = 'A';
      usage = 'Premium EV Battery Packs';
    } else if (cellVoltage >= 3.1 && cellIR <= 12.0 && cellCapacity >= 5500) {
      finalGrade = 'B';
      usage = 'Standard Solar Storage Packs';
    } else if (cellVoltage < 3.0 || cellIR > 15.0 || cellCapacity < 4500) {
      finalGrade = 'REJECT';
      usage = 'Scrap Reprocessing';
    }

    try {
      const parentItem = data?.inventory.find((i: any) => i.id === gradingParentId);
      const res = await fetch('/api/cells/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: gradingParentId,
          cellData: {
            serial: cellSerial.toUpperCase(),
            name: `${parentItem?.name || 'Prismatic Cell'} (Graded)`,
            grade: finalGrade,
            voltage: cellVoltage,
            ir: cellIR,
            capacity: cellCapacity,
            cycleCount: cellCycleCount,
            temp: cellTemp,
            engineer: qcEngineer,
            usage,
            supplier: parentItem?.supplier || 'Arcenol Depot'
          }
        })
      });

      if (!res.ok) throw new Error('Error saving cell data to graded vault.');
      
      setGradingSuccess(`SUCCESS: Registered Node ${cellSerial} as Grade ${finalGrade} (${usage})`);
      setCellSerial('');
      refetch();
      setTimeout(() => setGradingSuccess(''), 4000);
    } catch (err: any) {
      setSubmitError(err.message || 'Execution error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWarehouseTransfer = async () => {
    if (!transferItem || transferQty <= 0) return;
    if (transferQty > transferItem.qty) {
      setTransferError('Cannot transfer more than available stock.');
      return;
    }
    setTransferError('');
    setIsSubmitting(true);

    try {
      // API call or simulation on local state
      // Deducting from source, adding to destination
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          existingItemId: transferItem.id,
          qty: -transferQty,
          warehouse: sourceWh
        })
      });

      if (!res.ok) throw new Error('Failed to deduct from source');

      const res2 = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: transferItem.name,
          code: transferItem.code,
          category: transferItem.category,
          unit: transferItem.unit,
          qty: transferQty,
          warehouse: destWh,
          supplier: transferItem.supplier,
          batch: transferItem.batch + '-TR',
          rack: 'TR-1'
        })
      });

      if (!res2.ok) throw new Error('Failed to credit to destination');

      await refetch();
      setIsTransferModalOpen(false);
      setTransferItem(null);
      setTransferQty(0);
    } catch (e: any) {
      setTransferError(e.message || 'Transfer failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[500px]">
      <div className="relative p-8 bg-slate-100 rounded-full animate-bounce">
        <Database className="text-primary-600" size={48} />
      </div>
      <span className="font-sans font-black text-xs uppercase tracking-[0.3em] text-slate-400 mt-6">Calibrating Arcenol ERP Material Matrix...</span>
    </div>
  );

  const inventory = data?.inventory || [];
  const gradedCells = data?.gradedInventory || [];
  const warehouses = data?.warehouses || ["Main Warehouse", "Production Warehouse", "QC Warehouse", "Service Warehouse", "Scrap Warehouse"];
  const products = data?.products || [];

  // Sub-table searching/filtering
  const filteredProcureItems = inventory.filter((item: any) => {
    if (!subSearchProcure) return true;
    const term = subSearchProcure.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(term)) ||
      (item.code && item.code.toLowerCase().includes(term)) ||
      (item.supplier && item.supplier.toLowerCase().includes(term)) ||
      (item.batch && item.batch.toLowerCase().includes(term)) ||
      (item.category && item.category.toLowerCase().includes(term))
    );
  });

  const filteredGradingItems = gradedCells.filter((cell: any) => {
    if (!subSearchGrading) return true;
    const term = subSearchGrading.toLowerCase();
    return (
      (cell.serial && cell.serial.toLowerCase().includes(term)) ||
      (cell.grade && cell.grade.toLowerCase().includes(term)) ||
      (cell.engineer && cell.engineer.toLowerCase().includes(term)) ||
      (cell.usage && cell.usage.toLowerCase().includes(term))
    );
  });

  // Computed Values
  const totalValuation = inventory.reduce((acc: number, item: any) => acc + (item.qty * (item.price || 0)), 0);
  const rawStockQty = inventory.reduce((acc: number, i: any) => acc + i.qty, 0);
  const reservedQtySum = inventory.reduce((acc: number, i: any) => acc + (i.reservedQty || 0), 0);
  const lowMaterials = inventory.filter((item: any) => item.qty < (item.minStock || 0));
  
  // Graded distribution
  const gradeA = gradedCells.filter((c: any) => c.grade === 'A').length;
  const gradeB = gradedCells.filter((c: any) => c.grade === 'B').length;
  const gradeC = gradedCells.filter((c: any) => c.grade === 'C').length;
  const rejected = gradedCells.filter((c: any) => c.grade === 'REJECT').length;
  const totalGraded = gradedCells.length;

  const avgIR = totalGraded > 0 
    ? (gradedCells.reduce((acc: number, c: any) => acc + (c.ir || 0), 0) / totalGraded).toFixed(2)
    : "0.00";

  const supplierDefectsRatio = totalGraded > 0 
    ? ((rejected / totalGraded) * 100).toFixed(1)
    : "0.0";

  // Recharts Data Mapping
  const chartGradeData = [
    { name: 'Grade A Premium', value: gradeA || 20, fill: '#059669' },
    { name: 'Grade B Economy', value: gradeB || 12, fill: '#f59e0b' },
    { name: 'Grade C Secondary', value: gradeC || 8, fill: '#3b82f6' },
    { name: 'Rejected Scrap', value: rejected || 3, fill: '#ef4444' },
  ];

  const consumptionTrendData = [
    { month: 'Jan', cells: 4800, bms: 32 },
    { month: 'Feb', cells: 6200, bms: 45 },
    { month: 'Mar', cells: 7500, bms: 58 },
    { month: 'Apr', cells: 8200, bms: 60 },
    { month: 'May', cells: 9800, bms: 72 },
    { month: 'Jun', cells: 12000, bms: 88 },
  ];

  const filteredInventory = inventory.filter((item: any) => 
    (item.name.toLowerCase().includes(search.toLowerCase()) || 
     item.id.toLowerCase().includes(search.toLowerCase()) || 
     (item.code || '').toLowerCase().includes(search.toLowerCase())) &&
    (filterCategory === 'ALL' || item.category === filterCategory)
  );

  const categories = ['ALL', 'Cells', 'Electronics', 'RAW_MATERIAL', 'ACCESSORIES'];

  const flowStages = [
    { title: "RAW MATERIAL PURCHASE", desc: "Certified vendor purchase tracking", metric: `${inventory.length} SKU Catalog`, icon: Tag, color: "text-blue-500", bg: "bg-blue-50", action: () => { setFilterCategory('ALL'); setActiveTab('raw'); } },
    { title: "INWARD / GRN ENTRY", desc: "Goods Receipt Arrival Verification", metric: `Draft GRNs: 3`, icon: ArrowUpRight, color: "text-indigo-500", bg: "bg-indigo-50", action: () => { setIsProcureModalOpen(true); } },
    { title: "QUALITY CHECK (QC) HOLD", desc: "Safety inspection quarantined lot", metric: `${inventory.filter((i:any) => i.qcStatus === 'HOLD').length} Holds`, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", action: () => { setFilterCategory('ALL'); setActiveTab('raw'); } },
    { title: "GRADE / CLASSIFICATION", desc: "Ohmic impedance capacity sorting", metric: `${gradedCells.length} Graded Cells`, icon: Zap, color: "text-emerald-500", bg: "bg-emerald-50", action: () => { setActiveTab('graded'); } },
    { title: "RAW MATERIAL STORAGE", desc: "Warehouse rack shelf assignment", metric: `${warehouses.length} Active Hubs`, icon: Warehouse, color: "text-purple-500", bg: "bg-purple-50", action: () => { setActiveTab('warehouse'); } },
    { title: "MRP RESERVATION & ALLOCATION", desc: "BOM dynamic locking mechanism", metric: `${reservedQtySum} Reserved items`, icon: Sliders, color: "text-cyan-500", bg: "bg-cyan-50", action: () => { setActiveTab('mrp'); } },
    { title: "SEMI-FINISHED INVENTORY", desc: "WIP welded modules & calibrated circuit", metric: `${data?.wipInventory?.length || 0} Batches Active`, icon: ClipboardList, color: "text-rose-500", bg: "bg-rose-50", action: () => { setActiveTab('wip'); } },
    { title: "FINAL PRODUCT INVENTORY", desc: "Pack assembly complete certified lots", metric: `${data?.finishedGoods?.length || 0} Finished Packs`, icon: CheckCircle2, color: "text-sky-500", bg: "bg-sky-50", action: () => { } },
    { title: "DISPATCH / SALES LEDGER", desc: "E-Way bills, outbound commercial invoices", metric: `${data?.invoices?.length || 0} Invoices Generated`, icon: History, color: "text-teal-500", bg: "bg-teal-50", action: () => { } },
    { title: "RMA SERVICE RETURN", desc: "Defective disassembly reprocessing line", metric: `${data?.complaints?.length || 0} Incidents Logs`, icon: RefreshCw, color: "text-pink-500", bg: "bg-pink-50", action: () => { } },
  ];

  return (
    <div className={cn("space-y-8 pb-20 transition-all duration-300", isSyncing && "opacity-60 blur-[1px]")}>
      
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-[9px] font-black uppercase tracking-wider">Arcenol Energy Solutions</span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">ERP Node ID: 399878B5</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tighter uppercase italic mt-2">
            Lithium-Ion Inventory Matrix
          </h2>
          <p className="text-slate-400 font-sans text-xs font-bold uppercase tracking-widest mt-1">
            Raw Materials, Chemical Processing, Lab Grade Cells & BOM MRP Management
          </p>
        </div>
        
        <div className="flex items-center flex-wrap gap-3">
          <button 
            type="button"
            onClick={() => refetch()}
            className="p-3 bg-slate-50 text-slate-500 rounded-2xl border border-slate-200 hover:text-slate-900 shadow-sm hover:bg-slate-100 transition-all active:scale-95 flex items-center"
            title="Refresh Data Logs"
          >
            <RefreshCw size={18} className="animate-spin-slow" />
          </button>
          
          <button 
            onClick={() => { setIsProcureModalOpen(true); setSubmitError(''); }}
            className="bg-primary-600 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-wider flex items-center shadow-xl shadow-primary-500/10 hover:bg-primary-700 transition-all active:scale-95"
            id="btn_procure_inventory"
          >
            <Plus size={16} className="mr-2" /> Log Procurement
          </button>
          
          <button 
            onClick={() => setIsGradingModalOpen(true)}
            className="bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-wider flex items-center shadow-xl shadow-emerald-500/10 hover:bg-emerald-700 transition-all active:scale-95"
            id="btn_grading_lab"
          >
            <Microscope size={16} className="mr-2" /> QC Cell Testing
          </button>
        </div>
      </div>

      {/* Modern Horizontal Navigation Tabs */}
      <div className="flex space-x-1 p-1 bg-slate-100/80 rounded-[2rem] border border-slate-200/50 w-full overflow-x-auto whitespace-nowrap scrollbar-none shadow-inner">
        {[
          { id: 'dashboard', label: 'Inventory Overview & KPI', icon: BarChart3 },
          { id: 'raw', label: 'Raw Master Registry', icon: Package },
          { id: 'graded', label: 'Cell Grading Lab', icon: Zap },
          { id: 'mrp', label: 'MRP BOM Allocator', icon: Sliders },
          { id: 'wip', label: 'WIP Processing Line', icon: ClipboardList },
          { id: 'warehouse', label: 'Warehouse Hub & Transfer', icon: Warehouse }
        ].map(tab => (
          <button
            key={tab.id}
            id={`tab_${tab.id}`}
            onClick={() => handleAction(`Log switch to ${tab.label}`, () => setActiveTab(tab.id as any))}
            className={cn(
              "flex items-center px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300",
              activeTab === tab.id 
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/50 scale-[1.01]" 
                : "text-slate-500 hover:text-slate-900 hover:bg-white/40"
            )}
          >
            <tab.icon size={13} className="mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="animate-in fade-in duration-500 space-y-8">
          
          {/* Interactive Inventory Pipeline Architecture */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/80 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                <Layers size={180} />
             </div>
             
             <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-600 mr-2.5 animate-pulse"></span>
                      Integrated Inventory Pipeline Architecture
                   </h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Arcenol Energy Solutions Pvt Ltd — End-to-End Battery Manufacturing Lifecycle Flow (Interactive Stage-wise Map)
                   </p>
                </div>
                <span className="text-[9px] bg-primary-50 text-primary-600 font-black px-3 py-1.5 rounded-xl border border-primary-100 uppercase tracking-widest shrink-0">
                   REAL-TIME PRODUCTION SYNCHRONIZED
                </span>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
                {flowStages.map((stage, sIdx) => (
                   <div 
                      key={stage.title}
                      onClick={stage.action}
                      className="bg-slate-50 border border-slate-200/50 hover:bg-white hover:border-primary-200 hover:shadow-xl hover:shadow-slate-100 hover:scale-[1.03] transition-all duration-300 p-5 rounded-[1.8rem] flex flex-col justify-between cursor-pointer group relative overflow-hidden"
                   >
                      <div className="absolute right-3 top-2 text-[22px] font-black italic select-none text-slate-100 group-hover:text-primary-100/30 transition-colors leading-none">
                         {(sIdx + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="flex items-center space-x-3 mb-3 shrink-0">
                         <div className={cn("p-2 rounded-xl shrink-0 transition-transform group-hover:rotate-6", stage.bg, stage.color)}>
                            <stage.icon size={16} />
                         </div>
                         <h4 className="text-[11px] font-black text-slate-800 tracking-tight leading-snug group-hover:text-primary-600 transition-colors uppercase">
                            {stage.title}
                         </h4>
                      </div>
                      <div className="mt-2">
                         <p className="text-[9px] text-slate-400 font-medium leading-normal mb-3">
                            {stage.desc}
                         </p>
                         <p className="text-[10px] font-black text-slate-700 font-mono tracking-wide flex items-center bg-white/50 py-1.5 px-3 rounded-lg border border-slate-100 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 shrink-0 animate-pulse"></span>
                            {stage.metric}
                         </p>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            
            <div className="bg-white p-4 sm:p-5 lg:p-4 xl:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200/80 shadow-xs hover:border-primary-300 transition-all group min-w-0 overflow-hidden">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">Total Asset Value</p>
              <h4 className="text-lg sm:text-xl lg:text-base xl:text-xl 2xl:text-2xl font-black text-slate-800 mt-2 tracking-tighter italic font-mono truncate max-w-full block" title={formatCurrency(totalValuation)}>{formatCurrency(totalValuation)}</h4>
              <span className="text-[8px] bg-primary-50 text-primary-600 px-2 py-0.5 rounded-md font-bold uppercase mt-3 inline-block shrink-0">100% Audited</span>
            </div>

            <div className="bg-white p-4 sm:p-5 lg:p-4 xl:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all group min-w-0 overflow-hidden">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">Available Stock Qty</p>
              <h4 className="text-lg sm:text-xl lg:text-base xl:text-xl 2xl:text-2xl font-black text-slate-800 mt-2 tracking-tighter font-mono truncate max-w-full block" title={(rawStockQty).toLocaleString()}>{(rawStockQty).toLocaleString()}</h4>
              <span className="text-[8px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-bold uppercase mt-3 inline-block shrink-0">Active Stock</span>
            </div>

            <div className="bg-white p-4 sm:p-5 lg:p-4 xl:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all group min-w-0 overflow-hidden">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">MRP Reserved Stock</p>
              <h4 className="text-lg sm:text-xl lg:text-base xl:text-xl 2xl:text-2xl font-black text-slate-800 mt-2 tracking-tighter font-mono truncate max-w-full block" title={reservedQtySum.toLocaleString()}>{reservedQtySum.toLocaleString()}</h4>
              <span className="text-[8px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md font-bold uppercase mt-3 inline-block shrink-0">Locked Qty</span>
            </div>

            <div className={cn(
              "p-4 sm:p-5 lg:p-4 xl:p-6 rounded-[1.5rem] sm:rounded-[2rem] border transition-all group min-w-0 overflow-hidden",
              lowMaterials.length > 0 ? "bg-red-50/40 border-red-200 hover:border-red-400" : "bg-white border-slate-200/80 hover:border-emerald-300"
            )}>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">Low Stock SKUs</p>
              <h4 className={cn("text-lg sm:text-xl lg:text-base xl:text-xl 2xl:text-2xl font-black mt-2 tracking-tighter font-mono truncate max-w-full block", lowMaterials.length > 0 ? "text-red-650" : "text-slate-800")} title={lowMaterials.length.toString()}>
                {lowMaterials.length}
              </h4>
              <span className={cn(
                "text-[8px] px-2 py-0.5 rounded-md font-bold uppercase mt-3 inline-block shrink-0",
                lowMaterials.length > 0 ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
              )}>Reorder Alerts</span>
            </div>

            <div className="bg-white p-4 sm:p-5 lg:p-4 xl:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all group min-w-0 overflow-hidden">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">Grade A Cells</p>
              <h4 className="text-lg sm:text-xl lg:text-base xl:text-xl 2xl:text-2xl font-black text-emerald-600 mt-2 tracking-tighter font-mono flex items-baseline gap-1 min-w-0" title={`${gradeA} Pcs`}>
                <span className="truncate">{gradeA}</span>
                <span className="text-[10px] text-slate-400 font-normal shrink-0">Pcs</span>
              </h4>
              <span className="text-[8px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-bold uppercase mt-3 inline-block shrink-0">Premium Grade</span>
            </div>

            <div className="bg-white p-4 sm:p-5 lg:p-4 xl:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200/80 shadow-xs hover:border-red-300 transition-all group min-w-0 overflow-hidden">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">Scrap Inventory Weight</p>
              <h4 className="text-lg sm:text-xl lg:text-base xl:text-xl 2xl:text-2xl font-black text-red-600 mt-2 tracking-tighter font-mono flex items-baseline gap-1 min-w-0" title={`${rejected} Pcs`}>
                <span className="truncate">{rejected}</span>
                <span className="text-[10px] text-slate-400 font-normal shrink-0">Pcs</span>
              </h4>
              <span className="text-[8px] bg-red-50 text-red-500 px-2 py-0.5 rounded-md font-bold uppercase mt-3 inline-block shrink-0">Wastage Pool</span>
            </div>

          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Visual 1: Material Consumption Trend */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/80 shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider">Estimated Material Consumption Velocity</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Monthly consumption of Lithium Cells (Pcs) & Smart BMS Units</p>
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">H1 2026 Production</span>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={consumptionTrendData}>
                    <defs>
                      <linearGradient id="colorCells" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0891b2" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorBms" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="cells" name="Lithium Cells" stroke="#0891b2" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCells)" />
                    <Area type="monotone" dataKey="bms" name="BMS Packs" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBms)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Visual 2: Cell Grade Distribution */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider mb-1">Testing Grade Distribution</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lithium cell sorting parameters in laboratory environment</p>
                
                <div className="h-[180px] mt-6 flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartGradeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartGradeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} Cells`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Average IR Level</p>
                  <p className="text-2xl font-black text-primary-600 mt-1 italic tracking-tight">{avgIR} <span className="text-xs not-italic text-slate-400">mΩ</span></p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Supplier Defect %</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1 italic tracking-tight">{supplierDefectsRatio}%</p>
                </div>
              </div>
            </div>

          </div>

          {/* Active Stock Alerts and Thresholds */}
          <div className="bg-slate-900 text-slate-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 p-12 opacity-[0.03] text-white">
              <Boxes size={220} />
            </div>
            <div className="relative z-10">
              <h3 className="text-lg font-black uppercase tracking-wider text-white">Critical Procurement Optimization</h3>
              <p className="text-xs text-slate-400 mt-1">
                There are currently {lowMaterials.length} materials running below safety reservation levels. Automatic purchase orders are queued.
              </p>
            </div>
            <div className="flex gap-4 relative z-10 shrink-0">
              <button 
                onClick={() => { setActiveTab('raw'); setFilterCategory('ALL'); }}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all"
              >
                Track Shortages
              </button>
              <button 
                onClick={() => { setIsProcureModalOpen(true); }}
                className="px-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-black font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-primary-500/10"
              >
                Trigger Purchase ROL
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: RAW MATERIAL REGISTRY */}
      {activeTab === 'raw' && (
        <div className="animate-in fade-in duration-500 space-y-6">
          
          {/* Action Filter Bar */}
          <div className="bg-white p-4 rounded-[2rem] border border-slate-200/80 flex flex-wrap items-center gap-4 shadow-sm justify-between">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                placeholder="Search raw material by code, name, supplier, or batch..."
                className="w-full bg-slate-50 border border-slate-200/50 rounded-2xl py-3.5 pl-14 pr-6 text-xs font-bold text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-sans"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cat Class:</span>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-3 outline-none cursor-pointer"
              >
                {categories.map(cat => <option key={cat} value={cat} className="bg-white">{cat}</option>)}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-[2/5rem] border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5">Material Asset</th>
                    <th className="px-8 py-5">Product SKU Code</th>
                    <th className="px-8 py-5">Batch & GRN</th>
                    <th className="px-8 py-5">QC Status</th>
                    <th className="px-8 py-5">Storage Node Location</th>
                    <th className="px-8 py-5">Quantity Active</th>
                    <th className="px-8 py-5">Valuation</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-900 text-xs">
                  {filteredInventory.map((item: any) => {
                    const isLow = item.qty < (item.minStock || 0);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="font-sans font-black text-slate-900 tracking-tight text-[13px] uppercase group-hover:text-primary-600 transition-colors">{item.name}</p>
                          <span className="text-[9px] text-slate-400 font-medium uppercase mt-1 inline-block">{item.supplier}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-bold">{item.code || 'N/A'}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-600 block">B: {item.batch}</span>
                            <span className="text-[8px] text-slate-400 font-bold block">GRN: {item.grn || 'Manual'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-flex items-center border",
                            item.qcStatus === 'APPROVED' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                            {item.qcStatus === 'APPROVED' ? <CheckCircle2 size={10} className="mr-1.5" /> : <AlertTriangle size={10} className="mr-1.5" />}
                            {item.qcStatus || 'APPROVED'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-0.5">
                            <p className="font-sans font-black text-slate-700 text-[10px] uppercase leading-none">{item.warehouse}</p>
                            <span className="text-[9px] text-primary-600 font-bold tracking-widest leading-none">RACK: {item.rack || 'A-1'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            <p className={cn(
                              "text-sm font-black italic tracking-tighter leading-none",
                              isLow ? "text-red-500" : "text-slate-900"
                            )}>
                              {item.qty.toLocaleString()} <span className="text-[10px] not-italic font-bold text-slate-400 ml-0.5">{item.unit || 'Kg'}</span>
                            </p>
                            <span className="text-[8px] font-bold text-slate-400 block uppercase">Min ROL: {item.minStock || 100}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-black italic text-slate-800">
                          {formatCurrency(item.qty * (item.price || 150))}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => setSelectedQRItem(item)}
                              className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all shadow-sm"
                              title="Generate Barcode / QR Label"
                            >
                              <QrCode size={14} />
                            </button>
                            <button 
                              onClick={() => {
                                setTransferItem(item);
                                setSourceWh(item.warehouse);
                                setTransferQty(0);
                                setIsTransferModalOpen(true);
                              }}
                              className="p-2.5 bg-slate-50 text-slate-400 hover:text-primary-600 rounded-xl border border-slate-200 hover:bg-primary-50 transition-all shadow-sm"
                              title="Transfer Warehouse Stock"
                            >
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredInventory.length === 0 && (
                <div className="p-20 text-center">
                  <Boxes className="mx-auto text-slate-300 mb-4 animate-bounce" size={40} />
                  <p className="text-[11px] font-sans font-black text-slate-400 uppercase tracking-widest">No physical inventory records match query.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: CELL TESTING & GRADING LABORATORY */}
      {activeTab === 'graded' && (
        <div className="animate-in fade-in duration-500 space-y-8">
          
          {/* Lab Warning / QC Environment Checklist */}
          <div className="p-4 bg-[#f0fdf4] rounded-[1.5rem] border border-[#d1fae5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="p-2.5 bg-[#d1fae5] text-[#065f46] rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div className="text-left font-sans">
                <h4 className="font-extrabold text-[#065f46] text-xs uppercase tracking-wider">
                  ACTIVE QC ENVIRONMENT: LABORATORY STATUS CALIBRATION
                </h4>
                <p className="text-[10px] text-[#047857] leading-relaxed mt-0.5">
                  Electrochemistry chamber calibrated at standard <strong className="font-black">25°C ± 1°C</strong>. Absolute internal resistance sorting protocol is online.
                </p>
              </div>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <span className="inline-block px-5 py-2.5 bg-[#022c22] text-white rounded-full text-[9.5px] font-black uppercase tracking-widest leading-none select-none">
                CALIBRATED: ISO 9001/14001
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Lab Test Input Logs Form */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-3xs flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-widest mb-6 flex items-center gap-2">
                  <Microscope size={16} className="text-emerald-600" /> LOG LABORATORY CELL SPEC TEST
                </h3>
                
                <form onSubmit={handleSubmitCellGrading} className="space-y-4">
                  {submitError && (
                    <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-[11px] font-bold text-red-600 text-left">
                      {submitError}
                    </div>
                  )}

                  {gradingSuccess && (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-bold text-emerald-600 flex items-center text-left">
                      <CheckCircle2 size={14} className="mr-2 flex-shrink-0" />
                      {gradingSuccess}
                    </div>
                  )}

                  <div className="space-y-1.5 text-left">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block font-sans">BATCH MASTER SUPPLY MATCH</label>
                    <div className="relative">
                      <select
                        value={gradingParentId}
                        onChange={e => setGradingParentId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-xs font-black outline-none appearance-none cursor-pointer text-slate-805"
                      >
                        {inventory.filter((i: any) => i.id.includes('CELL') || i.category.toLowerCase().includes('cell')).map((i: any) => (
                          <option key={i.id} value={i.id} className="bg-white">
                            {i.name} ({i.qty} Pcs left)
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 text-[10px]">
                        ▼
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block font-sans">CELL SERIAL BARCODE IDENTIFIER</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. CELL-A-2026-99"
                      value={cellSerial}
                      onChange={e => setCellSerial(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 transition-colors rounded-xl py-3.5 px-4 text-xs font-black outline-none font-mono uppercase text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block font-sans">VOLTAGE (V)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        value={cellVoltage}
                        onChange={e => setCellVoltage(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 transition-colors rounded-xl py-3 px-4 text-xs font-black outline-none font-mono text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block font-sans">IR RESISTANCE (MΩ)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        required
                        value={cellIR}
                        onChange={e => setCellIR(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 transition-colors rounded-xl py-3 px-4 text-xs font-black outline-none font-mono text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block font-sans">CAPACITY (MAH)</label>
                      <input 
                        type="number" 
                        step="50"
                        required
                        value={cellCapacity || ''}
                        onChange={e => setCellCapacity(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 transition-colors rounded-xl py-3 px-4 text-xs font-black outline-none font-mono text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block font-sans">CYCLE COUNT TESTED</label>
                      <input 
                        type="number" 
                        required
                        value={cellCycleCount}
                        onChange={e => setCellCycleCount(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 transition-colors rounded-xl py-3 px-4 text-xs font-black outline-none font-mono text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block font-sans">TEMP LOGS (°C)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        required
                        value={cellTemp}
                        onChange={e => setCellTemp(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 transition-colors rounded-xl py-3 px-4 text-xs font-black outline-none font-mono text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block font-sans">QC ENGINEER SIGN</label>
                      <input 
                        type="text" 
                        required
                        value={qcEngineer}
                        onChange={e => setQcEngineer(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 transition-colors rounded-xl py-3 px-4 text-xs font-black outline-none text-slate-800"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#009270] hover:bg-[#007a5d] text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-md mt-4 disabled:opacity-50 cursor-pointer"
                  >
                    COMPUTE & RECORD CELL GRADE
                  </button>
                </form>
              </div>
            </div>

            {/* Laboratory Graded Repository */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="p-6 border-b border-slate-150 flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider">TECHNICAL GRADED REPOSITORY</h3>
                  <p className="text-[9px] text-[#009270] font-bold uppercase tracking-widest mt-0.5">ELECTRO-CHEMICAL METRICS OF ANALYZED LITHIUM CELLS</p>
                </div>
                <span className="text-[9.5px] font-black text-[#009270] bg-[#f0fdf4] border border-[#d1fae5] px-3.5 py-1.5 rounded-xl uppercase tracking-widest select-none leading-none">
                  Live Active Pool
                </span>
              </div>

              <div className="overflow-y-auto max-h-[460px] flex-1">
                <table className="w-full text-left font-mono text-slate-950 text-xs">
                  <thead className="bg-[#f8fafc] text-slate-500 text-[8.5px] font-black uppercase tracking-widest border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">SERIAL / DATE</th>
                      <th className="px-6 py-4">VOLTAGE</th>
                      <th className="px-6 py-4">INTERNAL RES (IR)</th>
                      <th className="px-6 py-4">CAPACITY</th>
                      <th className="px-6 py-4">ASSIGNED GRADE</th>
                      <th className="px-6 py-4 text-right">QC INSPECTOR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gradedCells.map((cell: any) => (
                      <tr key={cell.id} className="hover:bg-slate-50/50">
                        <td className="px-6 py-5 text-left font-sans">
                          <p className="font-extrabold text-slate-900 text-[12px] tracking-tight uppercase leading-none">{cell.serial}</p>
                          <span className="text-[9.5px] text-slate-400 font-bold leading-none block mt-1.5">{cell.date}</span>
                        </td>
                        <td className="px-6 py-5 font-bold text-slate-800 text-xs">{cell.voltage}V</td>
                        <td className="px-6 py-5 font-bold text-[#0284c7] text-xs">{cell.ir} mΩ</td>
                        <td className="px-6 py-5 font-bold text-slate-850 text-xs">{cell.capacity} mAh</td>
                        <td className="px-6 py-5 text-left">
                          <span className={cn(
                            "inline-block px-3 py-1 rounded-lg text-[9.5px] font-extrabold uppercase tracking-wider border text-center select-none",
                            cell.grade === 'A' ? "bg-emerald-50 text-emerald-600 border-emerald-150/60" :
                            cell.grade === 'B' ? "bg-amber-50 text-amber-600 border-amber-150/60" :
                            cell.grade === 'C' ? "bg-blue-50 text-blue-600 border-blue-150/60" :
                            "bg-red-50 text-red-650 border-red-150/60"
                          )}>
                            GRADE {cell.grade}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-sans text-[10.5px] uppercase font-extrabold text-slate-500">
                          {cell.engineer}
                        </td>
                      </tr>
                    ))}
                    {gradedCells.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center font-sans">
                          <Microscope className="mx-auto text-slate-200 mb-4 animate-pulse" size={40} />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No active graded items catalogued.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 4: MRP BOM AUTOMATIC ALLOCATION */}
      {activeTab === 'mrp' && (
        <div className="animate-in fade-in duration-500 space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Input Simulator Selection panel */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200/80 shadow-sm space-y-6 text-left">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight font-sans">
                  MRP MATERIALS CALCULATOR
                </h3>
                <p className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">
                  PRE-CALCULATE & VERIFY SAFETY MARGINS BASED ON MODEL BILL OF MATERIALS (BOM)
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">SELECT BATTERY MODEL TO MANUFACTURE</label>
                  <div className="relative">
                    <select
                      value={mrpProductModel}
                      onChange={e => {
                        setMrpProductModel(e.target.value);
                        setMrpResult(null);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-xs font-black outline-none cursor-pointer uppercase appearance-none text-slate-805"
                    >
                      {products.map((p: any) => (
                        <option key={p.id} value={p.id} className="bg-white">
                          {p.name} ({p.type})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 text-[10px]">
                      ▼
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">SCHEDULED BATCH QTY (UNITS)</label>
                  <input 
                    type="number"
                    min="1"
                    value={mrpQty}
                    onChange={e => {
                      setMrpQty(Number(e.target.value));
                      setMrpResult(null);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-black outline-none font-mono text-slate-800"
                  />
                </div>

                <button 
                  onClick={handleFetchMRP}
                  disabled={mrpLoading}
                  className="w-full bg-[#121c2b] hover:bg-[#1e2e46] text-white font-black text-xs uppercase tracking-widest py-4.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <Sliders size={16} /> SIMULATE BOM ALLOCATION
                </button>
              </div>

              {mrpMessage && (
                <div className="p-4 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider rounded-xl">
                  {mrpMessage}
                </div>
              )}
            </div>

            {/* Simulated Requirements Matrix */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="p-8 border-b border-indigo-100 bg-[#f8fafc] flex justify-between items-center flex-wrap gap-4">
                <div className="text-left">
                  <h3 className="text-sm md:text-base font-black uppercase text-slate-900 tracking-wider">BOM Dynamic Requirements Report</h3>
                  <p className="text-[9.5px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">Automated resource reservations based on estimated yield factors</p>
                </div>
                <span className="text-[9.5px] font-black text-indigo-650 bg-indigo-50 border border-indigo-150/40 px-3.5 py-1.5 rounded-xl uppercase tracking-widest select-none leading-none">
                  MRP Phase II Online
                </span>
              </div>

              <div className="overflow-x-auto flex-1 max-h-[380px] flex flex-col justify-center">
                {mrpResult ? (
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-[#f8fafc] text-slate-500 text-[8.5px] font-black uppercase tracking-widest border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">BOM Component Name</th>
                        <th className="px-6 py-4">Per Unit Qty</th>
                        <th className="px-6 py-4">Required Batch Qty</th>
                        <th className="px-6 py-4">Current Available</th>
                        <th className="px-6 py-4">Shortage Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mrpResult.requirements.map((reqm: any, index: number) => {
                        const isShort = reqm.deficient > 0;
                        return (
                          <tr key={index} className="hover:bg-slate-50/40">
                            <td className="px-6 py-4">
                              <p className="font-sans font-black text-slate-900 uppercase">{reqm.name}</p>
                              <span className="text-[8px] text-slate-400 font-bold block">CODE REF: {reqm.matId}</span>
                            </td>
                            <td className="px-6 py-4 font-black">{reqm.perUnit.toFixed(2)} {reqm.unit}</td>
                            <td className="px-6 py-4 font-black text-slate-800 italic">{reqm.requiredTotal.toLocaleString()} {reqm.unit}</td>
                            <td className="px-6 py-4 font-black text-emerald-600">{reqm.available.toLocaleString()} {reqm.unit}</td>
                            <td className="px-6 py-4">
                              {isShort ? (
                                <span className="inline-flex items-center px-2.5 py-1 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-wider rounded-md border border-red-100">
                                  Deficit: {reqm.deficient.toLocaleString()} {reqm.unit}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider rounded-md border border-emerald-100">
                                  Secure Stock
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-16 text-center font-sans">
                    <Sliders className="mx-auto text-slate-300/80 animate-pulse mb-4" size={32} />
                    <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      CONFIGURE MODEL AND PRESS "SIMULATE BOM ALLOCATION" TO GENERATE MAPPING.
                    </p>
                  </div>
                )}
              </div>

              {mrpResult && (
                <div className="p-8 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <h4 className="font-sans font-extrabold text-slate-900 text-xs uppercase">BOM Auto-allocation Trigger Flow</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Submit reservations to secure existing inventory</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleExecuteProductionPlan('RESERVE')}
                      className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                    >
                      Reserve Stock (Locked)
                    </button>
                    <button 
                      onClick={() => handleExecuteProductionPlan('CONSUME')}
                      className="px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-primary-500/10"
                    >
                      Consume Auto Deduct
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* TAB 5: WIP ASSEMBLIES */}
      {activeTab === 'wip' && (
        <div className="animate-in fade-in duration-500 space-y-6">
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider">Work in Progress (WIP) Semi-Finished Inventory</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active assembly queues, module welding, and live BMS calibration lines</p>
              </div>
              <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-100 uppercase">Operational Shopfloor</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(data?.wipInventory || []).map((wip: any) => (
                <div key={wip.id} className="bg-slate-50 rounded-[2rem] p-6 border border-slate-200/50 hover:bg-white hover:border-primary-200 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[9px] bg-slate-100 text-slate-600 font-black tracking-wider uppercase px-2 py-0.5 rounded-md">REF: {wip.id}</span>
                        <h4 className="text-base font-sans font-black text-slate-900 tracking-tight uppercase italic mt-1.5">{wip.name}</h4>
                      </div>
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-amber-100">{wip.stage}</span>
                    </div>

                    <div className="space-y-2 mb-6">
                      <p className="text-[10px] uppercase font-black text-slate-400">Yield Configuration</p>
                      <p className="text-2xl font-black text-slate-800 italic">{wip.qty} <span className="text-xs not-italic text-slate-400">Packs Active</span></p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase italic">Last Updated: {wip.lastUpdate}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/60 pt-4 mt-4">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">BOM Raw Allocation Details</p>
                    <div className="flex flex-wrap gap-2">
                      {wip.components.map((c: any, index: number) => (
                        <span key={index} className="text-[9px] bg-white text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 font-bold uppercase">
                          {c.matId.split('-').pop()}: {c.qty.toLocaleString()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: MULTI-WAREHOUSE NODES */}
      {activeTab === 'warehouse' && (
        <div className="animate-in fade-in duration-500 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {warehouses.map((wh: string, idx: number) => {
              // Calculate specific capacity mock percentages based on warehouse names
              const capPercentage = idx === 0 ? 82 : idx === 1 ? 45 : idx === 2 ? 60 : idx === 3 ? 30 : 15;
              return (
                <div key={wh} className="bg-white rounded-[2.5rem] p-8 border border-slate-200/80 hover:border-primary-200 hover:scale-[1.01] transition-all relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-500 group-hover:text-primary-600 transition-all flex items-center justify-center border border-slate-100">
                      <Warehouse size={22} />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-right">NODE ID</span>
                      <span className="text-[11px] font-mono font-black text-slate-700 block text-right">WH-ARC-0{idx+1}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 uppercase italic tracking-tight mb-2">{wh}</h3>
                  <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-wider">Arcenol Energy Logistics Core Group</p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1">
                        <span>Capacity Loading</span>
                        <span className="text-slate-800">{capPercentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-1000",
                            capPercentage > 80 ? "bg-red-500" : "bg-primary-600"
                          )} 
                          style={{ width: `${capPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 pt-4 border-t border-slate-100">
                      <span>Sync Status</span>
                      <span className="text-emerald-600 flex items-center"><ShieldCheck size={11} className="mr-1" /> ONLINE</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

       {/* MODAL 1: NEW PROCUREMENT */}
      {isProcureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[95vw] xl:max-w-7xl 2xl:max-w-[90vw] rounded-[2.5rem] border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[95vh] mx-4">
            
            {/* Header Plate */}
            <div className="p-8 md:p-10 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-[#0c9bbc]/10 text-[#0c9bbc] rounded-2xl shadow-inner">
                  <Database size={26} className="animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl md:text-3xl font-black font-sans text-slate-900 uppercase tracking-tight italic flex items-center gap-1">
                    INVENTORY PROCUREMENT ENTRY PLATE
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 font-sans">
                    LOG RAW ARRIVAL MATERIALS OR REGISTER NEW CELL CODES INTO THE CENTRAL NODE
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsProcureModalOpen(false)} 
                className="p-3 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-800 cursor-pointer border border-transparent hover:border-slate-200"
                id="close-procure-modal-top"
              >
                <X size={24} />
               </button>
            </div>

            {/* Split Screen Matrix */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-150">
              
              {/* Left Column: Form Intake Section */}
              <form 
                id="procure-form"
                onSubmit={handleSubmitProcurement} 
                className="flex-1 md:w-1/2 overflow-y-auto p-8 md:p-10 space-y-8 text-left"
              >
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-650 font-mono">
                    ⚠️ {submitError}
                  </div>
                )}

                {/* Procurement Mode Tab Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">PROCUREMENT MODE</label>
                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => setProcureType('existing')}
                      className={cn(
                        "py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                        procureType === 'existing' 
                          ? "bg-white text-slate-900 shadow-sm border border-slate-200/50 font-extrabold" 
                          : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      RESTOCK EXISTING ITEM
                    </button>
                    <button
                      type="button"
                      onClick={() => setProcureType('new')}
                      className={cn(
                        "py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                        procureType === 'new' 
                          ? "bg-white text-slate-900 shadow-sm border border-slate-200/50 font-extrabold" 
                          : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      REGISTER NEW MATERIAL
                    </button>
                  </div>
                </div>

                {/* Matcher Product Selection / Registration Inputs */}
                {procureType === 'existing' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">SELECT MATCHER SKU</label>
                    <div className="relative">
                      <select
                        value={selectedExistingId}
                        onChange={(e) => setSelectedExistingId(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#0c9bbc] transition-all rounded-xl py-4 px-5 text-sm font-black outline-none font-sans uppercase text-slate-800 appearance-none cursor-pointer shadow-3xs"
                      >
                        {inventory.map((item: any) => (
                          <option key={item.id} value={item.id}>
                            {item.name.toUpperCase()} ({item.code || item.id})
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-slate-500">
                        ▼
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">MATERIAL NAME</label>
                        <input
                          type="text"
                          required
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="e.g. Lead Alloy"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#0c9bbc] transition-all rounded-xl py-4 px-5 text-sm font-bold text-slate-800 outline-none shadow-3xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">CODE REFERENCE</label>
                        <input
                          type="text"
                          required
                          value={newCode}
                          onChange={(e) => setNewCode(e.target.value)}
                          placeholder="e.g. LA-001"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#0c9bbc] transition-all rounded-xl py-4 px-5 text-sm font-black outline-none font-mono uppercase text-slate-800 shadow-3xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">CLASSIFICATION CATEGORY</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#0c9bbc] transition-all rounded-xl py-4 px-5 text-sm font-black outline-none font-sans text-slate-800 cursor-pointer shadow-3xs"
                        >
                          <option value="RAW_MATERIAL">RAW_MATERIAL</option>
                          <option value="Cells">Cells</option>
                          <option value="Electronics">Electronics</option>
                          <option value="ACCESSORIES">ACCESSORIES</option>
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">BASE UNIT</label>
                        <input
                          type="text"
                          required
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          placeholder="e.g. Kg, Pcs, Ltr"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#0c9bbc] transition-all rounded-xl py-4 px-5 text-sm font-bold text-slate-800 outline-none shadow-3xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Vendor & Batch Group */}
                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">SUPPLIER COMPANY</label>
                    <input
                      type="text"
                      required
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      placeholder="e.g. Platinum Electronics"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0c9bbc] transition-all rounded-xl py-4 px-5 text-sm font-bold text-slate-800 outline-none shadow-3xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">BATCH MASTER ID</label>
                    <input
                      type="text"
                      required
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      placeholder="E.G. BATCH-72"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0c9bbc] transition-all rounded-xl py-4 px-5 text-sm font-black outline-none font-mono uppercase text-slate-800 shadow-3xs"
                    />
                  </div>
                </div>

                {/* GRN & Valuation Group */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">GRN REFERENCE MATCH</label>
                    <input
                      type="text"
                      required
                      value={grn}
                      onChange={(e) => setGrn(e.target.value)}
                      placeholder="E.G. GRN-998"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0c9bbc] transition-all rounded-xl py-4 px-5 text-sm font-black outline-none font-mono uppercase text-slate-800 shadow-3xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">BASE SUPPLIER VALUE (₹)</label>
                    <input
                      type="number"
                      required
                      value={price || ''}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="e.g. 150"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0c9bbc] transition-all rounded-xl py-4 px-5 text-sm font-black outline-none font-mono text-slate-800 shadow-3xs"
                    />
                  </div>
                </div>

                {/* Depot Routing Group */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">DESTINATION WAREHOUSE HUB</label>
                    <div className="relative">
                      <select
                        value={warehouse}
                        onChange={(e) => setWarehouse(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#0c9bbc] transition-all rounded-xl py-4 px-5 text-sm font-black outline-none font-sans text-slate-800 appearance-none cursor-pointer shadow-3xs"
                      >
                        {warehouses.map((wh: string) => (
                          <option key={wh} value={wh} className="bg-white">{wh}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-slate-500">
                        ▼
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">RACK SHELF ADDRESS</label>
                    <input
                      type="text"
                      required
                      value={rack}
                      onChange={(e) => setRack(e.target.value)}
                      placeholder="A-1"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0c9bbc] transition-all rounded-xl py-4 px-5 text-sm font-black outline-none font-mono uppercase text-slate-800 shadow-3xs"
                    />
                  </div>
                </div>

                {/* Key Metric Allocated counter box (cyan bordered highlight row) */}
                <div className="p-6 bg-cyan-50/70 rounded-2xl border border-cyan-150/80 flex items-center justify-between shadow-2xs">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider font-sans">ALLOCATED QUANTITY INFLOW</h4>
                    <p className="text-[10px] text-[#0c9bbc] font-black uppercase tracking-widest mt-1.5 font-sans">PHYSICAL DEPTH LOAD OF INCOMING ASSETS</p>
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    value={qty || ''}
                    onChange={(e) => setQty(Number(e.target.value))}
                    placeholder="0"
                    className="w-36 bg-white border border-[#2cbcdb]/40 hover:border-[#2cbcdb]/70 focus:border-[#0c9bbc] shadow-sm rounded-xl py-4 px-5 text-center text-sm font-black text-[#0a7f9a] outline-none font-mono"
                  />
                </div>
              </form>

              {/* Right Column: Inventory List/Table register section */}
              <div className="flex-1 md:w-1/2 overflow-y-auto p-8 md:p-10 bg-slate-50/50 flex flex-col space-y-6">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/70">
                  <div className="text-left">
                    <h4 className="text-sm md:text-base font-black text-slate-950 uppercase tracking-tight italic">INVENTORY PROCUREMENT REGISTER</h4>
                    <p className="text-[10px] text-slate-450 font-bold uppercase tracking-widest mt-1">CENTRAL NODE RAW MATERIALS & CELL BATCHES</p>
                  </div>
                  <span className="text-xs bg-cyan-50 text-[#0c9bbc] border border-cyan-150/50 font-black px-4.5 py-2.5 rounded-xl uppercase tracking-widest shadow-2xs select-none">
                    LIVE STOCK POOL
                  </span>
                </div>

                {/* Compact Search bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-4.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search active raw materials catalog..."
                    value={subSearchProcure}
                    onChange={(e) => setSubSearchProcure(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#0c9bbc] transition-colors rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none shadow-3xs text-slate-800 placeholder-slate-400"
                  />
                  {subSearchProcure && (
                    <button 
                      onClick={() => setSubSearchProcure('')}
                      className="absolute right-4 top-4.5 text-slate-400 hover:text-slate-900 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Register Table Block */}
                <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-2xs flex-1 min-h-[350px] flex flex-col">
                  <div className="overflow-x-auto flex-1 max-h-[520px]">
                    <table className="w-full text-left font-mono text-xs text-slate-950 border-collapse">
                      <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4.5">MATERIAL ASSET</th>
                          <th className="px-6 py-4.5">CODE / BATCH</th>
                          <th className="px-6 py-4.5 text-right w-24">QTY</th>
                          <th className="px-6 py-4.5 text-right pr-6">VALUATION (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredProcureItems.map((item: any) => {
                          const isLow = item.qty < (item.minStock || 0);
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-5.5 font-sans text-left">
                                <p className="font-extrabold text-slate-900 text-sm tracking-tight uppercase leading-snug">
                                  {item.name}
                                </p>
                                <span className="text-[11px] text-[#0c9bbc] font-black uppercase tracking-wider block mt-1.5">
                                  {item.supplier}
                                </span>
                              </td>
                              <td className="px-6 py-5.5 text-left">
                                <div className="space-y-1.5">
                                  <span className="inline-block text-[11px] font-mono font-black bg-slate-100 text-slate-700 px-2.5 py-1 border border-slate-200 rounded-md">
                                    {item.code || item.id}
                                  </span>
                                  <div className="text-[10px] text-slate-450 font-bold leading-none">
                                    B: {item.batch} | G: {item.grn}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5.5 text-right font-mono font-extrabold">
                                <span className={cn("text-xs", isLow ? "text-red-650" : "text-slate-800")}>
                                  {item.qty.toLocaleString()} {item.unit || 'Kg'}
                                </span>
                                {isLow && (
                                  <span className="block text-[9px] text-red-500 font-black uppercase tracking-widest mt-1 animate-pulse">
                                    LOW STOCK
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-5.5 text-right pr-6 font-mono font-extrabold text-slate-900">
                                <p className="text-xs">₹{((item.qty || 0) * (item.price || 0)).toLocaleString('en-IN')}</p>
                                <span className="block text-[9px] text-slate-400 font-bold tracking-wider mt-1">
                                  ₹{item.price || 0}/{item.unit || 'Kg'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredProcureItems.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-20 text-center font-sans">
                              <Boxes className="mx-auto text-slate-200 mb-4 animate-pulse" size={42} />
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                NO MATCHING INTERNAL STOCK FINDINGS.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Plate */}
            <div className="p-8 px-10 border-t border-slate-150 bg-slate-50 flex justify-end space-x-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsProcureModalOpen(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-8 py-4 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-colors cursor-pointer"
                id="dismiss-procure-modal"
              >
                DISMISS MODE
              </button>
              <button
                type="submit"
                form="procure-form"
                onClick={handleSubmitProcurement}
                disabled={isSubmitting}
                className="bg-[#009dbb] hover:bg-[#0487a2] text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-md shadow-[#009dbb]/25 cursor-pointer"
                id="commit-procure-modal"
              >
                {isSubmitting ? "SYNCING TRANSACTION..." : "COMMIT REST ENTRY"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: CELL GRADING & TESTING (QC CELL PORTAL) */}
      {isGradingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[95vw] xl:max-w-7xl 2xl:max-w-[90vw] rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[95vh] mx-4">
            
            {/* Header Plate */}
            <div className="p-8 md:p-10 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-emerald-100 text-[#009270] rounded-2xl shadow-inner">
                  <Microscope size={26} className="animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl md:text-3xl font-black font-sans text-slate-900 uppercase tracking-tight italic flex items-center">
                    QUALITY CONTROL CELL GRADING PANEL
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 font-sans">
                    LOG CELL SPECS TO AUTOMATICALLY MATCH GRADE A, B, C OR REJECT SCRAP CATEGORIES
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsGradingModalOpen(false)} 
                className="p-3 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-800 cursor-pointer border border-transparent hover:border-slate-200"
                id="close-grading-modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Split Screen Matrix */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-150">
              
              {/* Left Column: Form Intake Section */}
              <form 
                id="grading-form"
                onSubmit={handleSubmitCellGrading} 
                className="flex-1 md:w-1/2 overflow-y-auto p-8 md:p-10 space-y-8 text-left"
              >
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-650 font-mono">
                    ⚠️ {submitError}
                  </div>
                )}

                {gradingSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-600 font-mono">
                    ✨ {gradingSuccess}
                  </div>
                )}

                {/* Base Unsorted Reference */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">BASE UNSORTED INVENTORY REFERENCE</label>
                  <div className="relative">
                    <select
                      value={gradingParentId}
                      onChange={e => setGradingParentId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#009270] transition-colors rounded-xl py-4 px-5 text-sm font-black outline-none font-sans text-slate-850 appearance-none cursor-pointer shadow-3xs"
                    >
                      {inventory.filter((i: any) => i.id.includes('CELL') || i.category.toLowerCase().includes('cell')).map((i: any) => (
                        <option key={i.id} value={i.id} className="bg-white">
                          {i.name} ({i.qty} Pcs remaining in core raw stock)
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-slate-500">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Serial matching input */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">TESTED CELL SERIAL REFERENCE MATCH</label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. CELL-A-2026-0042"
                    value={cellSerial}
                    onChange={e => setCellSerial(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#009270] transition-colors rounded-xl py-4 px-5 text-sm font-black outline-none font-mono uppercase text-slate-800 shadow-3xs"
                  />
                </div>

                {/* 2-Column: Volts & Resistance */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">REST VOLTAGE TESTED (V)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={cellVoltage}
                      onChange={e => setCellVoltage(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#009270] transition-colors rounded-xl py-4 px-5 text-sm font-black outline-none font-mono text-slate-800 shadow-3xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">IR IMPEDANCE (MΩ)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={cellIR}
                      onChange={e => setCellIR(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#009270] transition-colors rounded-xl py-4 px-5 text-sm font-black outline-none font-mono text-slate-800 shadow-3xs"
                    />
                  </div>
                </div>

                {/* 2-Column: Capacity & Cycles */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">COULOMB CAPACITY TESTED (MAH)</label>
                    <input
                      type="number"
                      step="100"
                      required
                      value={cellCapacity}
                      onChange={e => setCellCapacity(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#009270] transition-colors rounded-xl py-4 px-5 text-sm font-black outline-none font-mono text-slate-800 shadow-3xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">SIMULATED CYCLES COUNT</label>
                    <input
                      type="number"
                      required
                      value={cellCycleCount}
                      onChange={e => setCellCycleCount(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#009270] transition-colors rounded-xl py-4 px-5 text-sm font-black outline-none font-mono text-slate-800 shadow-3xs"
                    />
                  </div>
                </div>

                {/* 2-Column: Temperature & Certifier */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">ELECTRODES TEMP (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={cellTemp}
                      onChange={e => setCellTemp(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#009270] transition-colors rounded-xl py-4 px-5 text-sm font-black outline-none font-mono text-slate-800 shadow-3xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block font-sans">LAB CERTIFIER SIGN</label>
                    <input
                      type="text"
                      required
                      value={qcEngineer}
                      onChange={e => setQcEngineer(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#009270] transition-colors rounded-xl py-4 px-5 text-sm font-extrabold text-slate-800 outline-none shadow-3xs"
                    />
                  </div>
                </div>
              </form>

              {/* Right Column: Graded cells repository register section */}
              <div className="flex-1 md:w-1/2 overflow-y-auto p-8 md:p-10 bg-slate-50/50 flex flex-col space-y-6">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/70">
                  <div className="text-left">
                    <h4 className="text-sm md:text-base font-black text-slate-950 uppercase tracking-tight italic">QUALITY CONTROL GRADED REPOSITORY</h4>
                    <p className="text-[10px] text-slate-450 font-bold uppercase tracking-widest mt-1">ELECTRO-CHEMICAL METRICS OF ANALYZED LITHIUM CELLS</p>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-150/50 font-black px-4.5 py-2.5 rounded-xl uppercase tracking-widest shadow-2xs select-none">
                    LIVE VAULT POOL
                  </span>
                </div>

                {/* Graded search input */}
                <div className="relative">
                  <Search className="absolute left-4 top-4.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search by serial number, grade, or specialist..."
                    value={subSearchGrading}
                    onChange={(e) => setSubSearchGrading(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#009270] transition-colors rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none shadow-3xs text-slate-800 placeholder-slate-400"
                  />
                  {subSearchGrading && (
                    <button 
                      onClick={() => setSubSearchGrading('')}
                      className="absolute right-4 top-4.5 text-slate-400 hover:text-slate-900 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Graded table block */}
                <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-2xs flex-1 min-h-[350px] flex flex-col">
                  <div className="overflow-x-auto flex-1 max-h-[520px]">
                    <table className="w-full text-left font-mono text-xs text-slate-950 border-collapse">
                      <thead className="bg-[#f8fafc] text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4.5">SERIAL / DATE</th>
                          <th className="px-6 py-4.5">VOLTAGE</th>
                          <th className="px-6 py-4.5">INTERNAL RES (IR)</th>
                          <th className="px-6 py-4.5">CAPACITY</th>
                          <th className="px-6 py-4.5">ASSIGNED GRADE</th>
                          <th className="px-6 py-4.5 text-right pr-6">QC INSPECTOR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {filteredGradingItems.map((cell: any) => (
                          <tr key={cell.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5.5 font-sans text-left">
                              <p className="font-extrabold text-slate-900 text-sm tracking-tight uppercase leading-none">
                                {cell.serial}
                              </p>
                              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-2 block">
                                {cell.date || "2024-05-18"}
                              </span>
                            </td>
                            <td className="px-6 py-5.5 text-left font-bold text-slate-800 text-xs">
                              {cell.voltage}V
                            </td>
                            <td className="px-6 py-5.5 text-left font-bold text-[#0284c7] text-xs font-mono">
                              {cell.ir} mΩ
                            </td>
                            <td className="px-6 py-5.5 text-left font-bold text-slate-850 text-xs font-mono">
                              {cell.capacity} mAh
                            </td>
                            <td className="px-6 py-5.5 text-left">
                              <span className={cn(
                                "inline-block px-4 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider border text-center select-none shadow-3xs",
                                cell.grade === 'A' ? "bg-emerald-50 text-emerald-600 border-emerald-150/60" :
                                cell.grade === 'B' ? "bg-amber-50 text-amber-600 border-amber-150/60" :
                                cell.grade === 'C' ? "bg-blue-50 text-blue-600 border-blue-150/60" :
                                "bg-red-50 text-red-650 border-red-150/60"
                              )}>
                                GRADE {cell.grade}
                              </span>
                            </td>
                            <td className="px-6 py-5.5 text-right pr-6 font-sans text-xs font-extrabold text-slate-500 uppercase leading-snug">
                              {cell.engineer || cell.inspector || "SURESH P."}
                            </td>
                          </tr>
                        ))}
                        {filteredGradingItems.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-20 text-center font-sans">
                              <Microscope className="mx-auto text-slate-200 mb-4 animate-pulse" size={42} />
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                NO GRADED CELL SPECIMENS REGISTERED YET.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Plate */}
            <div className="p-8 px-10 border-t border-slate-150 bg-slate-50 flex justify-end space-x-4 shrink-0">
              <button
                type="button"
                onClick={() => setIsGradingModalOpen(false)}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-8 py-4 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-colors cursor-pointer"
                id="dismiss-grading-modal"
              >
                CLOSE LAB PORTAL
              </button>
              <button
                type="submit"
                form="grading-form"
                onClick={handleSubmitCellGrading}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-md shadow-emerald-600/25 cursor-pointer"
                id="commit-grading-modal"
              >
                {isSubmitting ? "AUTHORIZING..." : "AUTHORIZE & GRADE CELL"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: WAREHOUSE STOCK TRANSFER */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight italic">
                  Internal Node Stock Transfer Flow
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Move materials between central, production, or scrap warehouse blocks safely
                </p>
              </div>
              <button onClick={() => setIsTransferModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {transferError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600">
                  {transferError}
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/50">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-sans">Active Transfer Target Asset</p>
                <h4 className="text-sm font-sans font-black text-slate-900 uppercase mt-1 leading-none">{transferItem?.name}</h4>
                <p className="text-[10px] font-mono text-primary-600 mt-2 font-bold uppercase">Source: {sourceWh} (Rack: {transferItem?.rack})</p>
                <p className="text-[10px] font-mono text-slate-500 font-bold mt-1 uppercase">Available: {transferItem?.qty} {transferItem?.unit}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">Transfer Destination Node</label>
                <select
                  value={destWh}
                  onChange={e => setDestWh(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-black outline-none font-sans"
                >
                  {warehouses.filter(w => w !== sourceWh).map(w => (
                    <option key={w} value={w} className="bg-white">{w}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Transfer Qty</label>
                <input
                  type="number"
                  min="1"
                  max={transferItem?.qty}
                  value={transferQty || ''}
                  onChange={e => setTransferQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-black outline-none font-mono"
                  placeholder={`Max: ${transferItem?.qty}`}
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button 
                onClick={() => setIsTransferModalOpen(false)}
                className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider"
              >
                Cancel Transfer
              </button>
              <button 
                onClick={handleWarehouseTransfer}
                disabled={isSubmitting || transferQty <= 0}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50"
              >
                Perform Transfer Order
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: QR & BARCODE PREVIEW LABEL CARD */}
      {selectedQRItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] border border-slate-200 shadow-2xl p-8 flex flex-col items-center">
            
            <div className="w-full flex justify-between items-center mb-6">
              <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-100">
                Print QR Tag Label
              </span>
              <button onClick={() => setSelectedQRItem(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X size={16} />
              </button>
            </div>

            {/* Print Area Preview */}
            <div className="w-full p-6 bg-slate-50 rounded-[2rem] border border-slate-200 flex flex-col items-center space-y-4 text-slate-900 border-dashed" id="qr-scannable-tag">
              <QRCodeSVG 
                value={`ARCENOL-SKU:${selectedQRItem.code || selectedQRItem.id}-BATCH:${selectedQRItem.batch}-GRN:${selectedQRItem.grn}-LOC:${selectedQRItem.warehouse}:${selectedQRItem.rack}`}
                size={160}
                bgColor="#f8fafc"
                fgColor="#0f172a"
              />
              
              <div className="text-center w-full">
                <h4 className="font-sans font-black text-slate-950 uppercase tracking-wider text-[13px] leading-tight">{selectedQRItem.name}</h4>
                <p className="font-mono text-[9px] text-slate-500 font-extrabold uppercase mt-1">INTERNAL SKU: {selectedQRItem.code || selectedQRItem.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full border-t border-slate-200/60 pt-4 text-left">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Warehouse Node</span>
                  <span className="text-[10px] font-sans font-black text-slate-900 uppercase block mt-1 leading-none">{selectedQRItem.warehouse}</span>
                </div>
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Address Target</span>
                  <span className="text-[10px] font-mono font-black text-slate-900 uppercase block mt-1 leading-none">RACK {selectedQRItem.rack || 'A-1'}</span>
                </div>
                
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Batch Assigned</span>
                  <span className="text-[10px] font-mono font-black text-slate-900 uppercase block mt-1 leading-none">{selectedQRItem.batch}</span>
                </div>
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Supplier</span>
                  <span className="text-[10px] font-sans font-black text-slate-900 uppercase block mt-1 leading-none truncate">{selectedQRItem.supplier}</span>
                </div>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-4 mt-6">
              <button 
                onClick={() => setSelectedQRItem(null)}
                className="w-full bg-white border border-slate-200 text-slate-600 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-center"
              >
                Dismiss Tag
              </button>
              <button 
                onClick={() => {
                  window.print();
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-1.5 shadow-md"
              >
                <Printer size={13} /> Print Sticker
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
