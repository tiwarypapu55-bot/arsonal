import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  CheckCircle, 
  Printer, 
  ArrowDown, 
  Layers, 
  ShieldCheck, 
  Users, 
  Cpu, 
  Zap, 
  Sparkles, 
  ExternalLink, 
  ChevronRight, 
  Monitor, 
  Apple, 
  Globe, 
  Bookmark, 
  Check,
  Star,
  ArrowRight,
  TrendingUp,
  Inbox,
  Shield,
  Clock,
  HeartHandshake,
  RefreshCw,
  Search,
  AlertTriangle,
  FileText,
  Activity,
  Barcode,
  Wifi,
  Lock,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface LandingPageProps {
  onBackToLogin?: () => void;
  isLoggedIn?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onBackToLogin, isLoggedIn = false }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CLIENTS' | 'DEALERS' | 'LOGISTICS'>('ALL');
  const [downloadingAppId, setDownloadingAppId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadCompleted, setDownloadCompleted] = useState<string[]>([]);

  // Simple feedback stats
  const [feedbackInput, setFeedbackInput] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // --- Real-time Node Synchronization States ---
  const [liveData, setLiveData] = useState<any>(null);
  const [loadingLive, setLoadingLive] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'CONNECTED' | 'SYNCING' | 'ERROR'>('CONNECTED');
  const [activeTabPanel, setActiveTabPanel] = useState<'DEVICES' | 'MARKSTATION'>('DEVICES');

  // Emulator 1: Customer Companion App States
  const [custSerial, setCustSerial] = useState('');
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custSubmitting, setCustSubmitting] = useState(false);
  const [custSuccess, setCustSuccess] = useState<string | null>(null);
  const [activeCustAppView, setActiveCustAppView] = useState<'HOME' | 'WARRANTY' | 'SUPPORT'>('HOME');
  
  // Customer Complaint States
  const [complaintSerial, setComplaintSerial] = useState('');
  const [complaintType, setComplaintType] = useState('Low Range');
  const [complaintNotes, setComplaintNotes] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState<string | null>(null);

  // Emulator 2: Vyapar Dealer Hub States
  const [dealerId, setDealerId] = useState('');
  const [dealerProductId, setDealerProductId] = useState('');
  const [dealerSerial, setDealerSerial] = useState('');
  const [dealerQty, setDealerQty] = useState(1);
  const [dealerCustEmail, setDealerCustEmail] = useState('');
  const [dealerSubmitting, setDealerSubmitting] = useState(false);
  const [dealerSuccess, setDealerSuccess] = useState<any | null>(null);
  const [showInvoicePrint, setShowInvoicePrint] = useState(false);

  // Emulator 3: Lager Logistics Scanner States
  const [logItemId, setLogItemId] = useState('');
  const [logQty, setLogQty] = useState(100);
  const [logAction, setLogAction] = useState<'ADD' | 'SUB'>('ADD');
  const [logNotes, setLogNotes] = useState('Grn stock receipt check');
  const [logSubmitting, setLogSubmitting] = useState(false);
  const [logSuccess, setLogSuccess] = useState<string | null>(null);
  const [scannedLogs, setScannedLogs] = useState<Array<{time: string, msg: string, status: string}>>([]);

  const apps = [
    {
      id: 'dtc-client',
      category: 'CLIENTS',
      title: 'Arcenol PowerCare App',
      subtitle: 'For End-User Customers',
      description: 'The definitive smart companion app for Arcenol solar battery clients. Monitor real-time charge depth, log warranty certificates instantly, trace solar conversion metrics, and book high-priority maintenance care with local field agents.',
      rating: '4.9 ★',
      size: '14.2 MB',
      version: 'v2.10.4',
      downloads: '18,500+ Installs',
      suitability: 'Supports all Arcenol smart household battery chassis series.',
      badge: 'Best Value',
      icon: Smartphone,
      platforms: [
        { type: 'ANDROID', name: 'Direct Android APK', sub: 'Optimized offline IoT capabilities', size: '14.2 MB', file: 'PowerCare_Direct_v2.apk' },
        { type: 'IOS', name: 'Safari Web App', sub: 'Zero-chrome layout container config', size: '2.4 MB', file: 'PowerCare_iOS.mobileconfig' },
        { type: 'PWA', name: 'Progressive Web App', sub: 'Cross-browser instant home-screen shortcut', size: 'Instant', file: 'PWA_Launch' }
      ]
    },
    {
      id: 'dealer-portal',
      category: 'DEALERS',
      title: 'Vyapar Retailer Hub',
      subtitle: 'For Dealers & Distributors',
      description: 'Empower your sales team and sub-dealers with our specialized accounting and placement app. Track multi-tiered credit status in real-time, generate instant client GST invoices directly at site delivery point, and unlock premium dealer reward levels.',
      rating: '4.8 ★',
      size: '18.7 MB',
      version: 'v4.1.2',
      downloads: '2,400+ Authorized Outlets',
      suitability: 'Restricted access — requires approved dealer credential key.',
      badge: 'Enterprise Grade',
      icon: Users,
      platforms: [
        { type: 'ANDROID', name: 'Retailer APK', sub: 'Encrypted storage with hardware security', size: '18.7 MB', file: 'VyaparHub_Dealer_v4.apk' },
        { type: 'PWA', name: 'Desktop Panel App', sub: 'For tablet and widescreen computer screens', size: 'Web-linked', file: 'PWA_Launch_Dealer' }
      ]
    },
    {
      id: 'store-keeper',
      category: 'LOGISTICS',
      title: 'Lager Logistix Unit',
      subtitle: 'For Storekeepers & Warehouses',
      description: 'Uncompromising high-speed tool for floor managers, loaders, and incoming raw assembly operators. Features instant integrated camera barcode scanning, responsive material check-sheets, buffer alerts, and physical sticker dispatch spoolers.',
      rating: '4.7 ★',
      size: '11.8 MB',
      version: 'v1.65.0',
      downloads: '15 Warehouses Active',
      suitability: 'Requires camera access permission for physical label reading.',
      badge: 'High Performance',
      icon: Layers,
      platforms: [
        { type: 'ANDROID', name: 'Logistics APK', sub: 'Camera-optimized high-frequency scan module', size: '11.8 MB', file: 'LagerUnit_Storekeeper_v1.apk' },
        { type: 'PWA', name: 'Methanol PWA Handshake', sub: 'Ideal for local hand-held zebra inventory guns', size: 'Lightweight', file: 'PWA_Launch_Logistics' }
      ]
    }
  ];

  // --- Real-time Polling Mechanism ---
  const fetchState = async (silent = false) => {
    if (!silent) setSyncStatus('SYNCING');
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const json = await res.json();
        setLiveData(json);
        setSyncStatus('CONNECTED');
        
        // Populate default dropdown selections once
        if (json.dealers?.length && !dealerId) setDealerId(json.dealers[0].id);
        if (json.products?.length && !dealerProductId) setDealerProductId(json.products[0].id);
        if (json.inventory?.length && !logItemId) setLogItemId(json.inventory[0].id);
        
        const readySerials = json.finishedGoods?.filter((f: any) => f.status === 'READY') || [];
        if (readySerials.length && !dealerSerial) {
          setDealerSerial(readySerials[0].serial);
        }
        
        const soldSerials = json.finishedGoods?.filter((f: any) => f.status === 'SOLD') || [];
        if (soldSerials.length && !custSerial) {
          setCustSerial(soldSerials[0].serial);
        }
        if (soldSerials.length && !complaintSerial) {
          setComplaintSerial(soldSerials[0].serial);
        }
      } else {
        setSyncStatus('ERROR');
      }
    } catch (e) {
      console.error(e);
      setSyncStatus('ERROR');
    } finally {
      setLoadingLive(false);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(() => fetchState(true), 3000); // Live poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const handleDownloadTrigger = (appId: string, platformFile: string) => {
    if (downloadingAppId) return;
    setDownloadingAppId(appId);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadingAppId(null);
          setDownloadCompleted(prevList => [...prevList, `${appId}-${platformFile}`]);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  // --- COMPONENT HANDLERS ---
  const registerWarrantySync = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustSubmitting(true);
    setCustSuccess(null);
    try {
      const res = await fetch('/api/sync/customer/register-warranty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serial: custSerial,
          customerName: custName,
          email: custEmail,
          phone: custPhone
        })
      });
      if (res.ok) {
        const result = await res.json();
        setCustSuccess(`Warranty Activated! Serial No: ${custSerial} is permanently linked to your profile.`);
        setCustName('');
        setCustEmail('');
        setCustPhone('');
        fetchState(true);
      } else {
        alert("Could not register warranty certificate.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCustSubmitting(false);
    }
  };

  const submitComplaintSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setComplaintSuccess(null);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serial: complaintSerial || custSerial,
          type: complaintType,
          notes: complaintNotes
        })
      });
      if (res.ok) {
        setComplaintSuccess(`Diagnostics ticket generated successfully! System assigned ticket with Unassigned engineer alert.`);
        setComplaintNotes('');
        fetchState(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const executeInvoiceSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setDealerSubmitting(true);
    setDealerSuccess(null);
    try {
      const p = liveData.products.find((prod: any) => prod.id === dealerProductId);
      const price = p ? p.price : 45000;
      
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId: dealerId,
          items: [{
            model: dealerProductId,
            qty: Number(dealerQty),
            serials: dealerSerial ? [dealerSerial] : [],
            price: price
          }],
          total: price * Number(dealerQty),
          tax: (price * Number(dealerQty)) * 0.18
        })
      });
      if (res.ok) {
        const inv = await res.json();
        setDealerSuccess(inv);
        // Add default logger entry to track
        setScannedLogs(prev => [
          { time: new Date().toLocaleTimeString(), msg: `Dealer invoice generated: ${inv.id}`, status: 'SUCCESS' },
          ...prev
        ]);
        fetchState(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDealerSubmitting(false);
    }
  };

  const executeInventorySync = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogSubmitting(true);
    setLogSuccess(null);
    try {
      const selectedItem = liveData.inventory.find((i: any) => i.id === logItemId);
      const res = await fetch('/api/sync/logistics/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: logItemId,
          deltaQty: Number(logQty),
          notes: logNotes + ` [${selectedItem ? selectedItem.name : ''}]`,
          action: logAction
        })
      });
      if (res.ok) {
        const out = await res.json();
        setLogSuccess(`Stock adjusted successfully! Code: ${out.item.code}. Current Qty: ${out.item.qty}`);
        setScannedLogs(prev => [
          { 
            time: new Date().toLocaleTimeString(), 
            msg: `Storekeeper: Tuned ${out.item.name} | Delta: ${logAction === 'ADD' ? '+' : '-'}${logQty} ${out.item.unit}`, 
            status: 'INFO' 
          },
          ...prev
        ]);
        fetchState(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLogSubmitting(false);
    }
  };

  const filteredApps = apps.filter(app => activeTab === 'ALL' || app.category === activeTab);

  // Helper lists from polled db
  const readyGoods = liveData?.finishedGoods?.filter((f: any) => f.status === 'READY') || [];
  const soldGoods = liveData?.finishedGoods?.filter((f: any) => f.status === 'SOLD') || [];
  const activeDealers = liveData?.dealers || [];
  const activeProducts = liveData?.products || [];
  const activeInventory = liveData?.inventory || [];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 selection:bg-[#912551] selection:text-white pb-16 font-sans">
      
      {/* 1. Header Banner */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-gradient-to-tr from-[#912551] to-[#e38676] rounded-2xl border border-white/10 shadow-md text-white">
              <Zap fill="currentColor" size={20} className="text-white shrink-0" />
            </div>
            <div>
              <span className="font-sans font-black text-xs uppercase tracking-[0.25em] text-[#e38676] block">Arcenol Energy Solutions</span>
              <span className="font-extrabold text-lg text-slate-900 tracking-tighter uppercase italic leading-none block">Universal Download & Sandbox</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Synchronizer Badge */}
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full">
              <span className={`w-2.5 h-2.5 rounded-full ${syncStatus === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : syncStatus === 'SYNCING' ? 'bg-amber-400 animate-spin' : 'bg-red-500'}`}></span>
              <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">
                {syncStatus === 'CONNECTED' ? 'CLOUD BACKEND OK' : syncStatus === 'SYNCING' ? 'SYNCING STATE...' : 'OFFLINE ERROR'}
              </span>
            </div>

            {onBackToLogin && !isLoggedIn && (
              <button 
                onClick={onBackToLogin}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-850 border border-slate-200 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-slate-950/5"
                id="back-to-login-header-btn"
              >
                Sign In to Command Console
              </button>
            )}
            {isLoggedIn && (
              <span className="text-[9px] font-black text-[#912551] bg-[#912551]/10 px-3 py-1.5 rounded-full border border-[#912551]/20 uppercase tracking-widest">
                Internal Operator Link
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Hero Section */}
      <div className="relative py-14 bg-gradient-to-b from-white to-slate-50 border-b border-slate-100 overflow-hidden text-left">
        <div className="absolute top-[-30%] right-[-10%] w-[50%] h-[50%] bg-[#e38676]/15 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-30%] left-[-10%] w-[50%] h-[50%] bg-[#912551]/15 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#912551]/10 border border-[#912551]/20 px-3.5 py-1.5 rounded-full text-[9px] font-black text-[#912551] uppercase tracking-[0.20em]">
            <Sparkles size={11} className="animate-spin text-[#e38676]" />
            REST-INTEGRATED MULTI-DEVICE PROTOCOL
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl leading-none font-black text-slate-900 tracking-tighter uppercase italic">
                Fully Synchronized <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#912551] to-[#e38676] not-italic">Device Ecosystem.</span>
              </h1>
              <p className="text-slate-500 font-medium text-xs md:text-sm leading-relaxed max-w-2xl">
                Try the live smart systems before deploying. Below you can download direct APK distributions or launch the **Virtual Handheld Emulators** side-by-side. Perform stock adjustments, register customer warranties, and create dealer invoices—all actions immediately reconcile through the Express backend in real-time.
              </p>
            </div>
            
            <div className="lg:col-span-4 flex justify-end gap-3 self-center">
              <button 
                onClick={() => {
                  const elem = document.getElementById('playground-station');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Smartphone size={16} className="text-[#e38676]" />
                Launch Live Playground
              </button>
              
              <button 
                onClick={() => {
                  const elem = document.getElementById('apk-downloads-station');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Download size={16} />
                Get Software APKs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Real-time Device Sandbox Section */}
      <div id="playground-station" className="max-w-7xl mx-auto px-6 py-12 text-left relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-[#912551] uppercase tracking-[0.3em]">INTEGRATION CONSOLE</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-2.5">
              <span>Virtual Multi-Device Playground</span>
              <span className="text-xs shrink-0 font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full tracking-normal animate-pulse">● LIVE REST SYNC</span>
            </h2>
            <p className="text-slate-400 text-xs font-medium max-w-xl">
              Simulate actions from different physical nodes. Touch inventory counts on the scanner, sell systems on the merchant app, and notice the change apply instantly across the subscriber companion!
            </p>
          </div>

          <button 
            onClick={() => fetchState()} 
            className="px-4 py-2 bg-[#912551]/5 hover:bg-[#912551]/10 border border-[#912551]/15 text-[#912551] text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 focus:outline-none"
          >
            <RefreshCw size={12} className={`${syncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
            Force State Refresh
          </button>
        </div>

        {/* Triple Column Smartphone Sandbox Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* DEVICE #1: WAREHOUSE LOGISTICS UNIT */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 uppercase tracking-tight">
                <Layers size={14} className="text-[#e38676]" />
                1. Lager Logistix
              </span>
              <span className="text-[8px] font-mono font-bold bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase">
                Warehouse Node
              </span>
            </div>

            {/* Smartphone Enclosure */}
            <div className="bg-[#0f172a] text-slate-100 rounded-[2.5rem] border-[6px] border-slate-800 p-6 min-h-[580px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="space-y-4">
                {/* Simulated Phone Status bar */}
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[8px] font-mono font-bold text-slate-400">DEV-NODE-LOGISTICS</span>
                  </div>
                  <span className="text-[8px] font-mono text-[#e38676] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-black tracking-widest">
                    ZEBRA-PRO
                  </span>
                </div>

                <div className="text-left space-y-1.5">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">PHYSICAL TRANSACTIONS</h3>
                  <p className="text-[9px] text-slate-400 leading-normal">
                    Adjust lead raw allocations, battery raw units, or BMS electronic stocks.
                  </p>
                </div>

                <form onSubmit={executeInventorySync} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      CHOOSE BARCODE COMMODITY:
                    </label>
                    {loadingLive ? (
                      <div className="h-9 bg-slate-800 rounded-lg animate-pulse"></div>
                    ) : (
                      <select 
                        value={logItemId}
                        onChange={(e) => setLogItemId(e.target.value)}
                        className="w-full bg-[#1e293b] text-white border border-slate-700/80 rounded-xl p-2.5 text-[11px] font-semibold outline-none focus:border-[#e38676] block"
                      >
                        {activeInventory.map((i: any) => (
                          <option key={i.id} value={i.id}>
                            {i.name} ({i.qty} {i.unit} in-stock)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        ACTION PROTOCOL:
                      </label>
                      <div className="flex bg-[#1e293b] rounded-xl p-0.5 border border-slate-700/80">
                        <button
                          type="button"
                          onClick={() => setLogAction('ADD')}
                          className={`flex-1 py-1 text-[9px] font-black rounded-lg transition-all ${logAction === 'ADD' ? 'bg-[#912551] text-white' : 'text-slate-400'}`}
                        >
                          RECEIVE (+)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogAction('SUB')}
                          className={`flex-1 py-1 text-[9px] font-black rounded-lg transition-all ${logAction === 'SUB' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
                        >
                          DEDUCT (-)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        QUANTITY CHANGE:
                      </label>
                      <input 
                        type="number"
                        required
                        min="1"
                        value={logQty}
                        onChange={(e) => setLogQty(Number(e.target.value))}
                        className="w-full bg-[#1e293b] text-white border border-slate-700/80 rounded-xl p-2 text-[11px] font-mono outline-none focus:border-[#e38676]" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      DISPATCH NOTE / GRN MEMO:
                    </label>
                    <input 
                      type="text"
                      required
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      placeholder="e.g. Received Lead alloy chunk GM-001"
                      className="w-full bg-[#1e293b] text-slate-100 border border-slate-700/80 rounded-xl p-2 text-[11px] font-semibold outline-none focus:border-[#e38676] placeholder:text-slate-500" 
                    />
                  </div>

                  {logSuccess && (
                    <div className="p-2 border border-emerald-800/40 bg-emerald-950/20 rounded-xl text-center">
                      <span className="text-[10px] text-emerald-400 font-bold block leading-relaxed">{logSuccess}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={logSubmitting || loadingLive}
                    className="w-full py-2.5 bg-[#e38676] hover:bg-[#d07364] text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 focus:outline-none"
                  >
                    <Barcode size={13} />
                    {logSubmitting ? "TRANSMITTING..." : "SUBMIT BARCODE TRANSACTION"}
                  </button>
                </form>

                {/* Live Stock Indicators */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">
                    CURRENT STATE-OF-STOCKS FEED:
                  </span>
                  
                  {loadingLive ? (
                    <div className="space-y-1">
                      <div className="h-5 bg-slate-800 rounded animate-pulse"></div>
                      <div className="h-5 bg-slate-800 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1 border border-white/5 bg-slate-950/45 p-2 rounded-xl">
                      {activeInventory.slice(0, 5).map((item: any) => {
                        const isLow = item.qty < item.minStock;
                        return (
                          <div key={item.id} className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-300 truncate max-w-28 font-bold">{item.name}</span>
                            <span className={`px-1.5 py-0.5 rounded font-black ${isLow ? 'bg-red-950/70 text-red-400 border border-red-900/60' : 'bg-slate-800 text-slate-300'}`}>
                              {item.qty} {item.unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Thermal Decal Spooler Info */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400">
                <span className="font-mono">Spooler: Connected</span>
                <span className="flex items-center gap-1 text-[#e38676] font-extrabold animate-pulse">
                  <Printer size={10} /> Online
                </span>
              </div>
            </div>
          </div>

          {/* DEVICE #2: MERCHANT DEALER VYAPAR HUB */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 uppercase tracking-tight">
                <Users size={14} className="text-[#912551]" />
                2. Vyapar Retailer Hub
              </span>
              <span className="text-[8px] font-mono font-bold bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">
                Merchant Node
              </span>
            </div>

            {/* Smartphone Enclosure */}
            <div className="bg-[#0f172a] text-slate-100 rounded-[2.5rem] border-[6px] border-slate-800 p-6 min-h-[580px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="space-y-4">
                {/* Simulated Phone Status bar */}
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    <span className="text-[8px] font-mono font-bold text-slate-400">DEALER-PORTAL-ONLINE</span>
                  </div>
                  <span className="text-[8px] font-mono text-[#912551] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-black tracking-widest">
                    GST-PAY
                  </span>
                </div>

                <div className="text-left space-y-1.5">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">CO-ORDINATE DISPATCH / SALES</h3>
                  <p className="text-[9px] text-slate-400 leading-normal">
                    Generate instant clients GST Invoices. This locks ready-stock serial numbers and activates customer warranties.
                  </p>
                </div>

                <form onSubmit={executeInvoiceSync} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      RETAIL OUTLET CREDIT ENTITY:
                    </label>
                    {loadingLive ? (
                      <div className="h-9 bg-slate-800 rounded-lg animate-pulse"></div>
                    ) : (
                      <select 
                        value={dealerId}
                        onChange={(e) => setDealerId(e.target.value)}
                        className="w-full bg-[#1e293b] text-white border border-slate-700/80 rounded-xl p-2.5 text-[11px] font-semibold outline-none focus:border-[#912551] block"
                      >
                        {activeDealers.map((d: any) => (
                          <option key={d.id} value={d.id}>
                            {d.company} (Score: {d.rankingScore})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        SELECT PRODUCT:
                      </label>
                      <select 
                        value={dealerProductId}
                        onChange={(e) => setDealerProductId(e.target.value)}
                        className="w-full bg-[#1e293b] text-white border border-slate-700/80 rounded-xl p-2 text-[10px] font-semibold outline-none focus:border-[#912551]"
                      >
                        {activeProducts.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        PIECE QTY:
                      </label>
                      <input 
                        type="number"
                        min="1"
                        max="1"
                        disabled
                        value={dealerQty}
                        className="w-full bg-[#1e293b]/50 text-slate-400 border border-slate-850 rounded-xl p-2 text-[11px] font-mono outline-none" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      ASSIGN READY SERIAL NUMBER:
                    </label>
                    {loadingLive ? (
                      <div className="h-9 bg-slate-800 rounded-lg animate-pulse"></div>
                    ) : (
                      <select 
                        value={dealerSerial}
                        onChange={(e) => setDealerSerial(e.target.value)}
                        className="w-full bg-[#1e293b] text-white border border-slate-700/80 rounded-xl p-2 text-[10.5px] font-mono outline-none focus:border-[#912551] block"
                      >
                        <option value="">-- Choose Factory-Ready Stock --</option>
                        {readyGoods.map((fg: any) => (
                          <option key={fg.id} value={fg.serial}>
                            {fg.serial} ({fg.warehouse})
                          </option>
                        ))}
                      </select>
                    )}
                    {readyGoods.length === 0 && (
                      <span className="text-[8px] text-amber-500 font-semibold block mt-1">
                        ⚠️ No factory ready warehouse stock! Use Logistics tool on left or ERP panels to manufacture some.
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      CLIENT EMAIL:
                    </label>
                    <input 
                      type="email"
                      required
                      value={dealerCustEmail}
                      onChange={(e) => setDealerCustEmail(e.target.value)}
                      placeholder="client@mail.com"
                      className="w-full bg-[#1e293b] text-white border border-slate-700/80 rounded-xl p-2 text-[11px] font-semibold outline-none focus:border-[#912551] placeholder:text-slate-500" 
                    />
                  </div>

                  {dealerSuccess && (
                    <div className="p-2 border border-indigo-800/40 bg-indigo-950/20 rounded-xl flex items-center justify-between">
                      <span className="text-[9px] text-indigo-300 font-extrabold truncate">Synced: {dealerSuccess.id}</span>
                      <button 
                        type="button"
                        onClick={() => setShowInvoicePrint(true)}
                        className="text-[8.5px] px-2 py-1 bg-indigo-900 border border-indigo-700 text-indigo-200 font-black uppercase rounded hover:bg-indigo-800"
                      >
                        Receipt Slip
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={dealerSubmitting || loadingLive || !dealerSerial}
                    className="w-full py-2.5 bg-[#912551] hover:bg-[#721c40] text-white font-black rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 focus:outline-none disabled:opacity-50"
                  >
                    <FileText size={13} />
                    {dealerSubmitting ? "AUTHORIZING..." : "LOG SALE & SYNC INVOICE"}
                  </button>
                </form>
              </div>

              {/* Status bar bottom */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400">
                <span className="font-mono">Ledger Node: ID-109</span>
                <span className="text-[#912551] font-mono font-black uppercase tracking-wider">
                  SECURE APIV4
                </span>
              </div>
            </div>
          </div>

          {/* DEVICE #3: END-USER CUSTOMER CLIENT */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 uppercase tracking-tight">
                <Smartphone size={14} className="text-[#912551]" />
                3. Customer PowerCare
              </span>
              <span className="text-[8px] font-mono font-bold bg-[#912551]/10 border border-[#912551]/20 text-[#912551] px-2 py-0.5 rounded-full uppercase">
                End-User App
              </span>
            </div>

            {/* Smartphone Enclosure */}
            <div className="bg-[#0f172a] text-slate-100 rounded-[2.5rem] border-[6px] border-slate-800 p-6 min-h-[580px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="space-y-4">
                {/* Simulated Phone Status bar */}
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-1 flex-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse"></span>
                    <span className="text-[8px] font-mono font-semibold text-slate-400">PowerCare Companion</span>
                  </div>
                  <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10 shrink-0">
                    <button
                      onClick={() => setActiveCustAppView('HOME')}
                      className={`px-2 py-0.5 text-[7.5px] font-black rounded uppercase transition-all ${activeCustAppView === 'HOME' ? 'bg-[#912551] text-white' : 'text-slate-400'}`}
                    >
                      Metrics
                    </button>
                    <button
                      onClick={() => setActiveCustAppView('WARRANTY')}
                      className={`px-2 py-0.5 text-[7.5px] font-black rounded uppercase transition-all ${activeCustAppView === 'WARRANTY' ? 'bg-[#912551] text-white' : 'text-slate-400'}`}
                    >
                      Warranty
                    </button>
                    <button
                      onClick={() => setActiveCustAppView('SUPPORT')}
                      className={`px-2 py-0.5 text-[7.5px] font-black rounded uppercase transition-all ${activeCustAppView === 'SUPPORT' ? 'bg-[#912551] text-white' : 'text-slate-400'}`}
                    >
                      Support
                    </button>
                  </div>
                </div>

                {/* VIEW 1: HOME METRICS */}
                {activeCustAppView === 'HOME' && (
                  <div className="space-y-3.5 text-left transition-all">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LIVE HOUSEHOLD METRICS</h4>
                      <h3 className="text-sm font-extrabold text-white leading-tight">CHASSIS ENERGY DECAL STATUS</h3>
                    </div>

                    <div className="p-3 bg-[#1e293b] rounded-2xl border border-slate-800 space-y-3 text-left">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                        <div>
                          <p className="text-[7.5px] font-mono text-slate-400 uppercase">SYS REPAIR LOG</p>
                          <p className="text-[10px] font-bold text-white uppercase mt-0.5">ARCENOL POWERPACK</p>
                        </div>
                        <span className="text-[8px] font-mono text-emerald-400 font-extrabold bg-emerald-950/80 px-2 py-0.5 border border-emerald-900 rounded">
                          HEALTHY
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="bg-[#0f172a] p-2 rounded-xl border border-slate-800">
                          <span className="block text-[7px] text-slate-400 uppercase tracking-wider font-semibold">CHARGE DEPTH</span>
                          <span className="block text-xs font-mono font-black text-[#e38676] mt-0.5">94.8% SLA</span>
                        </div>
                        <div className="bg-[#0f172a] p-2 rounded-xl border border-slate-800">
                          <span className="block text-[7px] text-slate-400 uppercase tracking-wider font-semibold">TEMP STATUS</span>
                          <span className="block text-xs font-mono font-black text-emerald-400 mt-0.5">26.5 °C</span>
                        </div>
                      </div>

                      <div className="p-2 sm:p-2.5 bg-slate-950/40 rounded-xl flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold text-[8px] uppercase">Warranty Status:</span>
                        {loadingLive ? (
                          <span className="h-3 w-12 bg-slate-800 animate-pulse"></span>
                        ) : (
                          <span className="text-[#e38676] font-mono font-black uppercase text-[8px]">
                            {soldGoods.length > 0 ? "CLAIM REGISTERED" : "NO SOLID REGISTRY"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-[#1e293b] rounded-2xl border border-slate-800 space-y-2 text-left">
                      <div className="flex items-center gap-1.5 text-xs text-slate-350 font-extrabold uppercase">
                        <Activity size={12} className="text-[#e38676]" />
                        <span>Recent Warranty Claims Logged</span>
                      </div>
                      <p className="text-[9px] text-slate-400 leading-normal">
                        See recent complaints globally. Polled in real-time from our service coordinators:
                      </p>
                      
                      <div className="space-y-1.5 max-h-16 overflow-y-auto pr-1">
                        {loadingLive ? (
                          <div className="h-4 bg-slate-800 animate-pulse"></div>
                        ) : (
                          liveData?.complaints?.slice(0, 3).map((comp: any) => (
                            <div key={comp.id} className="text-[9px] font-mono flex justify-between bg-slate-950/40 p-1.5 rounded text-slate-300">
                              <span className="truncate max-w-28 font-bold">{comp.serial}</span>
                              <span className="text-amber-500 font-black">{comp.type}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* VIEW 2: ACTIVATE WARRANTY */}
                {activeCustAppView === 'WARRANTY' && (
                  <div className="space-y-3 text-left transition-all">
                    <div>
                      <h4 className="text-[8px] font-black text-[#e38676] uppercase tracking-widest">WARRANTY ACTIVATION</h4>
                      <h3 className="text-xs font-black text-white leading-tight uppercase">ACTIVATE SMART GUARANTEE</h3>
                    </div>

                    <form onSubmit={registerWarrantySync} className="space-y-2.5">
                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          SELECT OR TYPE SERIAL:
                        </label>
                        {loadingLive ? (
                          <div className="h-9 bg-slate-800 rounded animate-pulse"></div>
                        ) : (
                          <select 
                            value={custSerial}
                            onChange={(e) => setCustSerial(e.target.value)}
                            className="w-full bg-[#1e293b] text-white border border-slate-700/80 rounded-xl p-2 text-[10.5px] font-mono outline-none focus:border-[#912551] block"
                          >
                            <option value="">-- Select Sold Unit to Register --</option>
                            {soldGoods.map((fg: any) => (
                              <option key={fg.id} value={fg.serial}>
                                {fg.serial} ({fg.model})
                              </option>
                            ))}
                          </select>
                        )}
                        <input 
                          type="text"
                          value={custSerial}
                          onChange={(e) => setCustSerial(e.target.value)}
                          placeholder="Or type custom serial..."
                          required
                          className="w-full bg-[#1e293b] text-white border border-slate-700/80 rounded-xl p-2 text-[10.5px] font-mono outline-none focus:border-[#e38676] mt-1.5 placeholder:text-slate-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[7px] font-black text-slate-400 uppercase mb-1">CUSTOMER NAME:</label>
                          <input 
                            type="text"
                            required
                            value={custName}
                            onChange={(e) => setCustName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-[#1e293b] text-white border border-slate-700/80 rounded-xl p-2 text-[10px] outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-[7px] font-black text-slate-400 uppercase mb-1">PHONE NUMBER:</label>
                          <input 
                            type="text"
                            required
                            value={custPhone}
                            onChange={(e) => setCustPhone(e.target.value)}
                            placeholder="+91..."
                            className="w-full bg-[#1e293b] text-white border border-slate-700/80 rounded-xl p-2 text-[10px] outline-none" 
                          />
                        </div>
                      </div>

                      {custSuccess && (
                        <div className="p-2 border border-emerald-800/40 bg-emerald-950/20 rounded-xl text-center">
                          <span className="text-[9px] text-emerald-400 font-bold block">{custSuccess}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={custSubmitting || loadingLive || !custSerial}
                        className="w-full py-2.5 bg-[#e38676] hover:bg-[#d07364] text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 focus:outline-none disabled:opacity-50"
                      >
                        <ShieldCheck size={13} />
                        {custSubmitting ? "ACTIVATING..." : "ACTIVATE SMART WARRANTY"}
                      </button>
                    </form>
                  </div>
                )}

                {/* VIEW 3: LODGE COMPLAINT / SUPPORT */}
                {activeCustAppView === 'SUPPORT' && (
                  <form onSubmit={submitComplaintSync} className="space-y-3.5 text-left transition-all">
                    <div>
                      <h4 className="text-[8px] font-black text-red-400 uppercase tracking-widest">RMA SERVICE HELPDESK</h4>
                      <h3 className="text-xs font-black text-white leading-tight uppercase">SUBMIT TECHNICAL TICKET</h3>
                    </div>

                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        RELEVANT BATTERY CHASSIS:
                      </label>
                      <select 
                        value={complaintSerial}
                        onChange={(e) => setComplaintSerial(e.target.value)}
                        className="w-full bg-[#1e293b] text-white border border-slate-700/80 rounded-xl p-2 text-[10.5px] font-mono outline-none focus:border-red-500 block"
                      >
                        <option value="">-- Select Registered Battery --</option>
                        {soldGoods.map((fg: any) => (
                          <option key={fg.id} value={fg.serial}>
                            {fg.serial}
                          </option>
                        ))}
                      </select>
                      <input 
                        type="text"
                        value={complaintSerial}
                        onChange={(e) => setComplaintSerial(e.target.value)}
                        placeholder="Or override type custom serial..."
                        required
                        className="w-full bg-[#1e293b] text-white border border-slate-700/80 rounded-xl p-2 text-[10.5px] font-mono outline-none focus:border-red-500 mt-1.5"
                      />
                    </div>

                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        FAILURE SYMPTOM CATEGORY:
                      </label>
                      <select 
                        value={complaintType}
                        onChange={(e) => setComplaintType(e.target.value)}
                        className="w-full bg-[#1e293b] text-white border border-slate-700/80 rounded-xl p-2 text-[10.5px] font-semibold outline-none focus:border-red-500 block"
                      >
                        <option value="Low Range">Low backup range / depth</option>
                        <option value="Dead on Arrival">Dead on arrival (no turn on)</option>
                        <option value="Voltage Drop">Rapid voltage drop / BMS cut</option>
                        <option value="High Temp">High battery chassis temperature</option>
                        <option value="Water Damage">Accidental fluid intake / water lock</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        SPECIFIC SYMPTOMS & OBSERVATIONS:
                      </label>
                      <textarea 
                        rows={2}
                        value={complaintNotes}
                        onChange={(e) => setComplaintNotes(e.target.value)}
                        placeholder="e.g. Battery drops from 70% to 10% within 15 minutes of load application."
                        required
                        className="w-full bg-[#1e293b] text-white border border-slate-700/80 rounded-xl p-2 text-[10px] outline-none focus:border-red-500 placeholder:text-slate-500"
                      />
                    </div>

                    {complaintSuccess && (
                      <div className="p-2 border border-emerald-900/40 bg-emerald-990/20 rounded-xl text-center">
                        <span className="text-[9px] text-emerald-400 font-bold block">{complaintSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loadingLive || !complaintSerial}
                      className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 focus:outline-none disabled:opacity-50"
                    >
                      <AlertTriangle size={13} />
                      TRANSMIT FIELD FAULT LOG
                    </button>
                  </form>
                )}
              </div>

              {/* Status bar bottom */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-400">
                <span className="font-mono flex items-center gap-1">
                  <Wifi size={10} className="text-emerald-400 animate-pulse" /> SIM-Card VG
                </span>
                <span className="text-[#e38676] font-mono font-black uppercase tracking-wider">
                  HEALTH CHECK ok
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Instructional Visual Sync Guide Map */}
        <div className="mt-12 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-[9px] font-black text-indigo-700 uppercase">
                <span>Phase I</span>
                <span>·</span>
                <span>Logistics Entry</span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900 uppercase">Input Stock Levels First</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Logistics managers adapt the raw lead/cell stock numbers. Submit changes in Device 1—and see the balances refresh instantly across the system database!
              </p>
            </div>

            <div className="space-y-2 border-t md:border-t-0 md:border-l md:border-r border-slate-100 md:px-8 py-4 md:py-0">
              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full text-[9px] font-black text-amber-700 uppercase">
                <span>Phase II</span>
                <span>·</span>
                <span>Dealers Invoice</span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900 uppercase">Sell Ready Serials</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dealers choose clean Finished battery goods. Tapping "Log Sale" marks serials as `SOLD`, preparing them for easy consumer registration!
              </p>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-pink-50 border border-pink-100 px-3 py-1 rounded-full text-[9px] font-black text-[#912551] uppercase">
                <span>Phase III</span>
                <span>·</span>
                <span>End User Claim</span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900 uppercase">Register Guarantee</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our customer client registers warranty on sold chassis in Device 3! Submitting tickets instantly notifies supervisors in the Operator central panels!
              </p>
            </div>

          </div>
        </div>

        {/* RECENT REAL-TIME LOCAL EVENT TICKER */}
        <div className="mt-8 bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl pointer-events-none"></div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#e38676]">
                EMULATION TRANSACTION LOGGER CONSOLE:
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full uppercase tracking-widest">
              SYSTEM TIME: {new Date().toLocaleTimeString()}
            </span>
          </div>

          <div className="space-y-2 font-mono text-[10px] max-h-40 overflow-y-auto pr-2 text-slate-350">
            {scannedLogs.length === 0 ? (
              <p className="text-slate-500 italic uppercase">
                No recent transactions processed. Choose any device form above to coordinate a synchronizing REST handshake!
              </p>
            ) : (
              scannedLogs.map((log, index) => (
                <div key={index} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0 scroll-mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[9px] shrink-0 font-bold select-none">[{log.time}]</span>
                    <span className={`${log.status === 'SUCCESS' ? 'text-emerald-400 font-bold' : log.status === 'ERROR' ? 'text-red-400 font-bold' : 'text-slate-250 font-medium'}`}>{log.msg}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${log.status === 'SUCCESS' ? 'bg-emerald-950/70 border border-emerald-900 text-emerald-400' : 'bg-slate-850 text-slate-400'}`}>
                    {log.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Beautiful Software Sideload Distributions Grid */}
      <div id="apk-downloads-station" className="max-w-7xl mx-auto px-6 py-12 text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-slate-100 pb-8">
          <div>
            <span className="text-[9px] font-black text-[#912551] uppercase tracking-[0.3em] block">DOWNLOAD CENTER</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic mt-1 pb-1">
              Direct Package Installation Archives
            </h2>
          </div>

          {/* Tab buttons for category filtration */}
          <div className="flex flex-wrap bg-slate-100 border border-slate-200 rounded-2xl p-1 gap-1 shadow-inner self-start shrink-0">
            {[
              { id: 'ALL', label: 'All App Packages' },
              { id: 'CLIENTS', label: 'Customers' },
              { id: 'DEALERS', label: 'Dealers & Outlets' },
              { id: 'LOGISTICS', label: 'Store Keepers' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? "bg-[#912551] text-white shadow-md shadow-[#912551]/10" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Apps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {filteredApps.map((app) => {
            const AppIcon = app.icon;
            return (
              <div 
                key={app.id} 
                className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl flex flex-col justify-between hover:translate-y-[-4px] hover:shadow-2xl transition-all duration-300 relative group"
              >
                <div className="space-y-6">
                  {/* Category Header */}
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-black tracking-widest bg-slate-50 border border-slate-200 text-slate-400 px-3 py-1 rounded-full uppercase">
                      {app.category}
                    </span>
                    <span className="text-[10px] font-mono text-[#912551] font-black tracking-wide">
                      {app.downloads}
                    </span>
                  </div>

                  {/* Icon & Title - Stacked to guarantee title width and eliminate layout squeezing */}
                  <div className="space-y-4">
                    <div className="inline-flex p-3 rounded-2xl bg-[#912551]/5 border border-[#912551]/10 text-[#912551] group-hover:bg-[#912551]/10 transition-colors shrink-0 mb-1">
                      <AppIcon size={22} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-[15px] md:text-base leading-snug uppercase font-sans tracking-tight break-normal">{app.title}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 break-normal leading-normal">{app.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {app.description}
                  </p>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10.5px] font-semibold text-slate-600">
                    <p className="font-extrabold uppercase text-[8px] text-slate-400 tracking-wider">CHASSIS & HARDWARE COMPATIBILITY</p>
                    <p className="mt-1">{app.suitability}</p>
                  </div>

                  {/* Specifications list */}
                  <div className="grid grid-cols-2 gap-3 text-center bg-slate-50/50 p-3 rounded-xl border border-slate-100/80">
                    <div>
                      <span className="block text-[7px] font-black text-slate-400 uppercase leading-none">PKG VERSION</span>
                      <span className="block text-xs font-mono font-extrabold text-slate-800 mt-1">{app.version}</span>
                    </div>
                    <div>
                      <span className="block text-[7px] font-black text-slate-400 uppercase leading-none">RATING INDEX</span>
                      <span className="block text-xs font-mono font-extrabold text-amber-500 mt-1 flex items-center justify-center gap-1">
                        <Star size={10} fill="currentColor" /> {app.rating.replace(' ★', '')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Platform Download Control Station */}
                <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">CHOOSE YOUR APPLICATION ARCHITECTURE:</p>
                    <div className="space-y-2">
                      {app.platforms.map((platform) => {
                        const isThisDownloading = downloadingAppId === `${app.id}-${platform.type}`;
                        const isThisCompleted = downloadCompleted.includes(`${app.id}-${platform.file}`);

                        return (
                          <div 
                            key={platform.type} 
                            className="bg-white border border-slate-200 hover:border-[#912551]/30 rounded-2xl p-3 flex flex-col justify-between hover:bg-slate-50/50 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="p-1 px-[2px] bg-slate-100 font-mono text-[9px] font-black text-slate-600 rounded min-w-[28px] text-center">
                                  {platform.type}
                                </div>
                                <div className="text-left min-w-0">
                                  <p className="font-extrabold text-[11px] text-slate-900 truncate leading-none uppercase">{platform.name}</p>
                                  <p className="text-[8.5px] font-medium text-slate-400 mt-1 truncate">{platform.sub}</p>
                                </div>
                              </div>

                              <span className="text-[9px] font-mono text-slate-400 font-bold shrink-0">
                                {platform.size}
                              </span>
                            </div>

                            {/* Download Action Progress Trigger */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                              {isThisDownloading ? (
                                <div className="w-full space-y-1.5">
                                  <div className="flex justify-between items-center text-[7.5px] font-black uppercase text-slate-400 tracking-wider">
                                    <span>PULLING FROM ONLINE ARCHIVE...</span>
                                    <span>{downloadProgress}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                    <div className="h-full bg-gradient-to-r from-[#912551] to-[#e38676] transition-all" style={{ width: `${downloadProgress}%` }}></div>
                                  </div>
                                </div>
                              ) : isThisCompleted ? (
                                <div className="w-full flex items-center justify-between animate-in zoom-in-95 duration-200">
                                  <span className="flex items-center text-emerald-600 font-black text-[9px] uppercase tracking-wider gap-1.5">
                                    <CheckCircle size={12} /> {platform.file} Pinned!
                                  </span>
                                  <button 
                                    onClick={() => handleDownloadTrigger(app.id, platform.type)}
                                    className="text-[8px] font-black uppercase text-[#912551] hover:underline"
                                  >
                                    Re-Download
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleDownloadTrigger(`${app.id}-${platform.type}`, platform.file)}
                                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white rounded-xl text-[9.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  <Download size={11} className="text-[#e38676]" />
                                  Instantly Download File
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Sticky Sticker Station & thermal Print decal layout */}
      <div className="bg-white py-16 border-t border-b border-slate-100 text-left">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-[9px] font-black text-[#912551] uppercase tracking-[0.3em]">SECURE LABELLING & STICKER DECAL STATION</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
              Heavy Duty Sticker Dispatch Console
            </h2>
            <p className="text-slate-500 font-medium text-xs leading-relaxed">
              Print robust high-durability thermal stickers to attach directly onto physical battery packaging. Customers can instantly scan this QR tag on-site to register and synchronize their warranty credentials!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Template Card */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-tr from-[#0f172a] to-[#1e293b] text-white border border-slate-800 flex flex-col justify-between min-h-[300px]">
              <div className="space-y-4">
                <div className="inline-block bg-[#912551]/30 border border-[#912551]/40 px-3 py-1 rounded-full text-[8.5px] font-black text-[#e38676] uppercase tracking-widest">
                  DECAL SERIAL TEMPLATES
                </div>
                <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-tight">PRINT COMPATIBLE DECALS</h3>
                <p className="text-slate-400 font-medium text-xs leading-relaxed">
                  Every manufactured Arcenol battery body ships with professional thermal QR codes. Simply output print-compatible labels from our <span className="font-extrabold text-[#e38676]">Customer Engagement Module</span> to distribute decal sheets to physical casing teams in Gandhinagar.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-800/80 flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-450">Template link URL:</span>
                  <span className="bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] font-mono text-[#e38676] rounded font-bold uppercase select-all">https://arcenol.com/powercare</span>
                </div>
              </div>
            </div>

            {/* Support and FAQ Section */}
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/60 text-left space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Need Sideloading APK Support?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Our direct Android packages bypass standard Play Store structures to support quick local SQL storage capabilities. Ensure "Install Unknown Applications" triggers are permitted in your device security settings!
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/60 text-left space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Can dealers login using the smart client apk?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  No. The companion customer app is intended strictly for warranty tracking and telemetry indexing. Authorized dealer technicians must use the dedicated <span className="font-bold text-slate-805">Vyapar Retailer Hub</span> container.
                </p>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/60 text-left space-y-2">
                <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">How is raw warehouse material synced?</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Scanning components inside the emulated logistics tracker immediately changes raw counts on the central in-memory warehouse databases, warning you of reorder alerts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Feedback & Inquiries Box */}
      <div className="max-w-4xl mx-auto px-6 py-12 text-center space-y-8">
        <div className="space-y-2">
          <span className="text-[9px] font-black text-[#912551] uppercase tracking-[0.25em]">CUSTOMER SATISFACTION STATION</span>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">Have installation concerns? Let our admins know!</h3>
          <p className="text-slate-500 text-xs font-semibold max-w-lg mx-auto">
            Submit bugs, request raw iOS MobileConfig files, or ask for direct engineer callback support.
          </p>
        </div>

        {feedbackSubmitted ? (
          <div className="max-w-md mx-auto p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3 animate-in zoom-in-95 duration-200">
            <CheckCircle className="text-emerald-500 mx-auto" size={32} />
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Callback request registered!</h4>
            <p className="text-xs text-slate-600">Our regional technology support team will respond to your query within 24 hours.</p>
            <button 
              onClick={() => { setFeedbackSubmitted(false); setFeedbackInput(''); }}
              className="text-[10px] font-black text-[#912551] uppercase tracking-wider hover:underline font-mono"
            >
              Submit Another Message
            </button>
          </div>
        ) : (
          <form 
            onSubmit={(e) => { e.preventDefault(); if (feedbackInput.trim()) setFeedbackSubmitted(true); }}
            className="max-w-lg mx-auto flex items-center bg-white border border-slate-200 rounded-2xl p-2.5 shadow-md"
          >
            <input 
              type="text" 
              required
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="Enter your email or phone + brief request..." 
              className="flex-1 bg-transparent px-4 py-2.5 text-xs font-semibold outline-none text-slate-800 placeholder:text-slate-400"
            />
            <button 
              type="submit"
              className="px-6 py-3.5 bg-[#912551] hover:bg-[#721c40] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 shrink-0"
            >
              Get Callback Support
            </button>
          </form>
        )}

        <div className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider select-none flex items-center justify-center gap-2">
          <span>SECURED BY ARCENOL ENERGY IT</span>
          <span>·</span>
          <span>SYSTEM TIME: {new Date().toUTCString()}</span>
        </div>
      </div>

      {/* --- INVOICE THERMAL PRINT MODAL OVERLAY --- */}
      {showInvoicePrint && dealerSuccess && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[999]">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl text-slate-900 border border-slate-100 text-left animate-in zoom-in-95 duration-200">
            
            <div className="text-center space-y-2 border-b border-dashed border-slate-300 pb-4">
              <Zap fill="currentColor" size={28} className="mx-auto text-[#912551] shrink-0" />
              <div>
                <h3 className="font-extrabold text-[13px] uppercase tracking-wider text-slate-950">ARCENOL ENERGY SOLS</h3>
                <p className="text-[9px] text-slate-500 font-mono">GIDC Gandhi Nagar, Gujarat</p>
                <p className="text-[8px] text-slate-400 font-mono">GSTIN: 24AAHCA9192M1ZP</p>
              </div>
            </div>

            <div className="space-y-2.5 font-mono text-[10px] text-slate-750">
              <div className="flex justify-between">
                <span>INVOICE REF:</span>
                <span className="font-bold text-slate-950">{dealerSuccess.id}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE STAMP:</span>
                <span>{dealerSuccess.date}</span>
              </div>
              <div className="flex justify-between">
                <span>DEALER LINK:</span>
                <span className="font-bold max-w-28 truncate">{dealerSuccess.dealerId}</span>
              </div>
              <div className="flex justify-between">
                <span>WARRANTY CO:</span>
                <span className="text-emerald-600 font-black">ACTIVE (36 MO)</span>
              </div>
            </div>

            <table className="w-full font-mono text-[10px] border-t border-b border-dashed border-slate-300 py-3 block">
              <thead className="w-full block">
                <tr className="flex justify-between text-slate-400 pb-1">
                  <th className="text-left font-normal">ITEM DETAIL</th>
                  <th className="text-right font-normal">AMT / TAX</th>
                </tr>
              </thead>
              <tbody className="w-full block space-y-1">
                {dealerSuccess.items?.map((item: any, i: number) => (
                  <tr key={i} className="flex justify-between text-slate-950 font-bold">
                    <td className="truncate max-w-32 uppercase">{item.model} ST (Qty {item.qty})</td>
                    <td>₹{item.price?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1.5 font-mono text-[10px]">
              <div className="flex justify-between text-slate-550 border-t pt-2">
                <span>Net Total Amount:</span>
                <span>₹{dealerSuccess.total?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-550">
                <span>CGST + SGST (18%):</span>
                <span>₹{dealerSuccess.tax?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-950 font-black text-xs pt-1">
                <span>GRAND TOTAL:</span>
                <span>₹{(dealerSuccess.total + dealerSuccess.tax).toLocaleString()}</span>
              </div>
            </div>

            {dealerSuccess.items?.[0]?.serials?.[0] && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider">SECURE SERIAL LOCK:</p>
                <p className="text-[11px] font-mono font-black text-slate-900 flex items-center gap-1.5 break-all">
                  <Barcode size={14} className="text-slate-650 shrink-0" />
                  {dealerSuccess.items[0].serials[0]}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Printer size={12} /> Print Ticket
              </button>
              <button
                onClick={() => setShowInvoicePrint(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-[10px] uppercase tracking-widest rounded-xl transition-all"
              >
                Dismiss
              </button>
            </div>
            
            <p className="text-center font-mono text-[8px] text-slate-400 uppercase leading-snug">
              Thank you for trusting Arcenol Energy Solutions.<br />
              This is a digital synchronized transaction.
            </p>
          </div>
        </div>
      )}
      
    </div>
  );
};
