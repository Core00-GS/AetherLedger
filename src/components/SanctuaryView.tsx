import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Home, 
  ShoppingBag, 
  RotateCw, 
  Trash2, 
  Sparkles, 
  Trophy, 
  Shield, 
  Coins, 
  ChevronRight,
  Info,
  Check,
  Package,
  Compass,
  Zap,
  ArrowRight
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { Category, PlacedFurniture } from '../types';

// Pre-defined House Tiers
export interface HouseTemplate {
  id: string;
  name: string;
  description: string;
  gridSize: number;
  price: number;
  unlockedLevel: number;
  accentColor: string;
  shadowColor: string;
}

export const HOUSES: HouseTemplate[] = [
  {
    id: 'capsule',
    name: '京都微型太空艙 (Capsule Suite)',
    description: '坐落於新京都高層霓虹街區的標準艙防。環境緊湊，賽博精緻感十足。',
    gridSize: 6,
    price: 0,
    unlockedLevel: 1,
    accentColor: '#00f2ff',
    shadowColor: 'rgba(0, 242, 255, 0.15)'
  },
  {
    id: 'studio',
    name: '秋葉原御宅工作室 (Otaku Lab)',
    description: '動漫極客與數位駭客的夢想基地。支持更多佈置空間，配備全息痛牆掛鉤。',
    gridSize: 8,
    price: 350,
    unlockedLevel: 3,
    accentColor: '#ff00c8',
    shadowColor: 'rgba(255, 0, 200, 0.15)'
  },
  {
    id: 'penthouse',
    name: '等離子浮空大廈 (Aether Penthouse)',
    description: '俯瞰整個不夜城的頂層奢華公寓。配備抗重力太陽能露台與極大規模自訂空間。',
    gridSize: 10,
    price: 800,
    unlockedLevel: 5,
    accentColor: '#9775fa',
    shadowColor: 'rgba(151, 117, 250, 0.15)'
  }
];

// Pre-defined Furniture Categories
export interface FurnitureTemplate {
  id: string;
  name: string;
  price: number;
  levelRequired: number;
  category: 'bed' | 'electronic' | 'table' | 'decor' | 'special';
  description: string;
  width: number; // 1 or 2
  height: number; // 1 or 2
}

export const FURNITURE_TEMPLATES: FurnitureTemplate[] = [
  {
    id: 'tatami',
    name: '賽博榻榻米 (Cyber Tatami)',
    price: 25,
    levelRequired: 1,
    category: 'decor',
    description: '邊緣鍍有高週波離子條的特製榻榻米，編織材質極佳。',
    width: 2,
    height: 2
  },
  {
    id: 'cyber_bed',
    name: '智能低溫休眠艙 (Cryo Capsule)',
    price: 120,
    levelRequired: 1,
    category: 'bed',
    description: '半透明鋼化液晶艙罩，內置新陳代謝減緩波與全息催眠燈。',
    width: 2,
    height: 1
  },
  {
    id: 'workstation',
    name: '二次元電競主控台 (Otaku Battlestation)',
    price: 180,
    levelRequired: 1,
    category: 'electronic',
    description: '配備三連屏環繞極速顯示器、發光機械鍵盤與全息初音歌姬立牌。',
    width: 2,
    height: 1
  },
  {
    id: 'kotatsu',
    name: '暖呼呼量子暖爐桌 (Neo Kotatsu)',
    price: 85,
    levelRequired: 1,
    category: 'table',
    description: '日式暖桌與量子微波加熱技術的結合，被子外沿閃爍著溫暖的微光。',
    width: 2,
    height: 2
  },
  {
    id: 'bonsai',
    name: '極光全息盆栽 (Aurora Bonsai)',
    price: 45,
    levelRequired: 2,
    category: 'decor',
    description: '由高維光學稜鏡折射出的粉櫻松柏，隨意飘落數位櫻花光斑。',
    width: 1,
    height: 1
  },
  {
    id: 'sword_rack',
    name: '離子雙刀武士架 (Dual Katana Base)',
    price: 140,
    levelRequired: 3,
    category: 'decor',
    description: '展示著熱等離子切割刀（妖刀村正・千子）與電磁震盪合金刃（白羽）。',
    width: 1,
    height: 1
  },
  {
    id: 'vocaloid_stage',
    name: '虛擬歌姬全息投影 (Holo Vocaloid)',
    price: 250,
    levelRequired: 4,
    category: 'special',
    description: '播放經典極客音樂，投影出一個不斷旋轉舞蹈的迷你全息雙馬尾少女。',
    width: 2,
    height: 2
  },
  {
    id: 'arcade',
    name: '像素風復古異次元街機 (Arcade Pod)',
    price: 150,
    levelRequired: 2,
    category: 'electronic',
    description: '投幣式經典大盒子！顯示器上迴圈播放點陣像素少女冒險遊戲。',
    width: 1,
    height: 1
  },
  {
    id: 'aether_core',
    name: '以太能量共振水晶 (Aether Matrix)',
    price: 400,
    levelRequired: 5,
    category: 'special',
    description: '由純淨藍色星能晶體打造的浮空矩陣，釋放出美麗的脈衝發光微粒。',
    width: 1,
    height: 1
  },
  {
    id: 'plush_sofa',
    name: '星雲萌物痛沙發 (Cosplay Sofa)',
    price: 90,
    levelRequired: 1,
    category: 'decor',
    description: '極佳舒適度的低空萌色沙發，放有各種電子小惡魔與貓咪造型靠枕。',
    width: 2,
    height: 1
  }
];

interface SanctuaryViewProps {
  userXP: number;
  userLevel: number;
  aetherCreds: number;
  purchasedFurniture: string[];
  purchasedHouses: string[];
  currentHouseId: string;
  placedFurniture: PlacedFurniture[];
  expenses: { amount: number; type: string; date: string }[];
  budgets: { category: string; amount: number }[];
  
  // State Update Callbacks
  onAddAetherCreds: (amount: number) => void;
  onAddXP: (amount: number) => void;
  onUpdateSanctuary: (updates: {
    userXP?: number;
    userLevel?: number;
    aetherCreds?: number;
    purchasedFurniture?: string[];
    purchasedHouses?: string[];
    currentHouseId?: string;
    placedFurniture?: PlacedFurniture[];
  }) => void;
}

export default function SanctuaryView({
  userXP,
  userLevel,
  aetherCreds,
  purchasedFurniture,
  purchasedHouses,
  currentHouseId,
  placedFurniture,
  expenses,
  budgets,
  onAddAetherCreds,
  onAddXP,
  onUpdateSanctuary
}: SanctuaryViewProps) {
  const [shopTab, setShopTab] = useState<'buy_furniture' | 'buy_house' | 'bag'>('buy_furniture');
  const [editingFurnitureId, setEditingFurnitureId] = useState<string | null>(null);
  const [selectedShopItem, setSelectedShopItem] = useState<FurnitureTemplate | null>(null);
  const [selectedBagItem, setSelectedBagItem] = useState<string | null>(null); // itemId
  
  // Placement State
  const [placementMode, setPlacementMode] = useState<boolean>(false);
  const [ghostX, setGhostX] = useState<number>(0);
  const [ghostY, setGhostY] = useState<number>(0);
  const [ghostRotation, setGhostRotation] = useState<number>(0);

  // Active House Configuration
  const activeHouse = useMemo(() => {
    return HOUSES.find(h => h.id === currentHouseId) || HOUSES[0];
  }, [currentHouseId]);

  const activeGridSize = activeHouse.gridSize;

  // Level Up requirement threshold
  const xpNeededForNextLevel = useMemo(() => {
    return userLevel * 150;
  }, [userLevel]);

  // Budget vs Savings Bounty calculation
  // Allows users to claim a frugality bonus relative to their budget discipline!
  const frugalStatus = useMemo(() => {
    const thisMonth = format(new Date(), 'yyyy-MM');
    const monthlyExpenses = expenses
      .filter(e => e.date.startsWith(thisMonth) && e.type === 'EXPENSE')
      .reduce((sum, e) => sum + e.amount, 0);

    const overallBudget = budgets.find(b => b.category === 'OVERALL')?.amount || 2000;
    const remaining = Math.max(0, overallBudget - monthlyExpenses);
    const savingsRate = overallBudget > 0 ? (remaining / overallBudget) * 100 : 50;

    // Daily yield reward based on frugality
    const checkInClaimableCreds = Math.floor(remaining * 0.05);
    const checkInClaimableXP = Math.floor(savingsRate * 1.5);
    
    return {
      monthlyExpenses,
      overallBudget,
      remaining,
      savingsRate,
      checkInClaimableCreds,
      checkInClaimableXP
    };
  }, [expenses, budgets]);

  // Check which spots on grid are occupied
  const occupiedGrid = useMemo(() => {
    const grid = Array.from({ length: activeGridSize }, () => Array(activeGridSize).fill(null));
    placedFurniture.forEach(f => {
      const template = FURNITURE_TEMPLATES.find(t => t.id === f.itemId);
      if (!template) return;
      
      const rot = f.rotation;
      let w = template.width;
      let h = template.height;
      if (rot === 90 || rot === 270) {
        w = template.height;
        h = template.width;
      }

      for (let ix = f.x; ix < f.x + w; ix++) {
        for (let iy = f.y; iy < f.y + h; iy++) {
          if (ix >= 0 && ix < activeGridSize && iy >= 0 && iy < activeGridSize) {
            grid[ix][iy] = f.id;
          }
        }
      }
    });
    return grid;
  }, [placedFurniture, activeGridSize]);

  // Check if placement is valid
  const isValidPlacement = (itemId: string, x: number, y: number, rotation: number, ignoreInstanceId?: string) => {
    const template = FURNITURE_TEMPLATES.find(t => t.id === itemId);
    if (!template) return false;

    let w = template.width;
    let h = template.height;
    if (rotation === 90 || rotation === 270) {
      w = template.height;
      h = template.width;
    }

    if (x < 0 || x + w > activeGridSize || y < 0 || y + h > activeGridSize) {
      return false; // bounds check
    }

    for (let ix = x; ix < x + w; ix++) {
      for (let iy = y; iy < y + h; iy++) {
        const occupier = occupiedGrid[ix][iy];
        if (occupier && occupier !== ignoreInstanceId) {
          return false; // overlap check
        }
      }
    }
    return true;
  };

  // Execute buy action for furniture
  const handleBuyFurniture = (item: FurnitureTemplate) => {
    if (aetherCreds < item.price) return;
    if (userLevel < item.levelRequired) return;

    const newCreds = aetherCreds - item.price;
    const updatedBag = [...purchasedFurniture, item.id];
    onUpdateSanctuary({
      aetherCreds: newCreds,
      purchasedFurniture: updatedBag
    });
    setSelectedShopItem(null);
  };

  // Real-time Frugality Check-In Claiming (Claim reward on frugality save rate)
  const [streakClaimed, setStreakClaimed] = useState<boolean>(false);
  const handleClaimCheckin = () => {
    if (streakClaimed) return;
    setStreakClaimed(true);
    
    const credBonus = Math.max(15, frugalStatus.checkInClaimableCreds);
    const xpBonus = Math.max(25, frugalStatus.checkInClaimableXP);

    onAddXP(xpBonus);
    onAddAetherCreds(credBonus);

    // Auto level calculation
    const currentTotalXP = userXP + xpBonus;
    let currentLvl = userLevel;
    let requiredXP = currentLvl * 150;
    let tempXP = currentTotalXP;

    while (tempXP >= requiredXP) {
      tempXP -= requiredXP;
      currentLvl += 1;
      requiredXP = currentLvl * 150;
    }

    if (currentLvl > userLevel) {
      onUpdateSanctuary({
        userXP: tempXP,
        userLevel: currentLvl,
        aetherCreds: aetherCreds + credBonus + (currentLvl * 50) // level up bonus Aether Creds!
      });
      // Show Level Up animation
      alert(`🎉 恭喜升級！您已晉升至等級 ${currentLvl} 宇宙管理官！解鎖了更多高級虛擬建材與家園別墅！`);
    } else {
      onUpdateSanctuary({
        userXP: tempXP,
        aetherCreds: aetherCreds + credBonus
      });
    }
  };

  const handleBuyHouse = (house: HouseTemplate) => {
    if (aetherCreds < house.price) return;
    if (userLevel < house.unlockedLevel) return;

    const newCreds = aetherCreds - house.price;
    const updatedHouses = [...purchasedHouses, house.id];
    onUpdateSanctuary({
      aetherCreds: newCreds,
      purchasedHouses: updatedHouses,
      currentHouseId: house.id
    });
  };

  // Inventory bag counting
  const bagInventoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    purchasedFurniture.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });

    // Subtract placed instances
    placedFurniture.forEach(f => {
      if (counts[f.itemId]) {
        counts[f.itemId] -= 1;
      }
    });

    return counts;
  }, [purchasedFurniture, placedFurniture]);

  // Initiate placement
  const handleStartPlacement = (itemId: string) => {
    setSelectedBagItem(itemId);
    setPlacementMode(true);
    setGhostX(0);
    setGhostY(0);
    setGhostRotation(0);
  };

  // Confirm placing
  const handleConfirmPlacement = (targetX?: number, targetY?: number) => {
    if (!selectedBagItem) return;
    const tx = targetX !== undefined ? targetX : ghostX;
    const ty = targetY !== undefined ? targetY : ghostY;

    if (!isValidPlacement(selectedBagItem, tx, ty, ghostRotation)) return;

    const newPlacement: PlacedFurniture = {
      id: crypto.randomUUID(),
      itemId: selectedBagItem,
      x: tx,
      y: ty,
      rotation: ghostRotation
    };

    const updated = [...placedFurniture, newPlacement];
    onUpdateSanctuary({
      placedFurniture: updated
    });

    // Award +10 XP for building/decorating!
    onAddXP(10);

    setPlacementMode(false);
    setSelectedBagItem(null);
  };

  // Modify current placed piece
  const handleRotatePlaced = (instanceId: string) => {
    const target = placedFurniture.find(f => f.id === instanceId);
    if (!target) return;

    const nextRotation = (target.rotation + 90) % 360;
    if (isValidPlacement(target.itemId, target.x, target.y, nextRotation, instanceId)) {
      const updated = placedFurniture.map(f => 
        f.id === instanceId ? { ...f, rotation: nextRotation } : f
      );
      onUpdateSanctuary({ placedFurniture: updated });
    }
  };

  const handleDeconstruct = (instanceId: string) => {
    const updated = placedFurniture.filter(f => f.id !== instanceId);
    onUpdateSanctuary({ placedFurniture: updated });
    setEditingFurnitureId(null);
  };

  // Isometric screen coordinate calculations (Classic isometric projection 2:1 ratio)
  const getIsometricPosition = (x: number, y: number) => {
    const size = 32; // base size
    const screenX = (x - y) * size;
    const screenY = (x + y) * (size / 2);
    return { x: screenX, y: screenY };
  };

  // Custom detailed vectors to draw beautiful 3D isometric designs
  const renderItemSVG = (itemId: string, rotation: number) => {
    const strokeColors = {
      tatami: '#51CF66',
      cyber_bed: '#00f2ff',
      workstation: '#ff00c8',
      kotatsu: '#F76707',
      bonsai: '#FF8787',
      sword_rack: '#E599F7',
      vocaloid_stage: '#20C997',
      arcade: '#FCC419',
      aether_core: '#15AABF',
      plush_sofa: '#A61E4D'
    };
    
    const color = strokeColors[itemId as keyof typeof strokeColors] || '#00f2ff';

    // Renders custom, artistic SVGs inside isometric cells
    switch (itemId) {
      case 'tatami':
        return (
          <g transform={`rotate(${rotation}, 32, 16)`}>
            <polygon points="32,2 62,17 32,32 2,17" fill="rgba(81, 207, 102, 0.15)" stroke={color} strokeWidth="1.5" />
            <polygon points="32,4 58,17 32,30 6,17" fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="32" y1="8" x2="32" y2="26" stroke={color} strokeWidth="1" opacity="0.4" />
          </g>
        );
      case 'cyber_bed':
        return (
          <g transform={`rotate(${rotation}, 32, 16)`}>
            {/* Sleeping Capsule */}
            <polygon points="32,2 62,17 32,32 2,17" fill="rgba(0, 242, 255, 0.1)" stroke={color} strokeWidth="1" />
            <path d="M 12,12 L 12,-16 L 42, -5 L 42, 23 Z" fill="rgba(0, 242, 255, 0.2)" stroke={color} strokeWidth="1.5" />
            {/* Glow Screen */}
            <path d="M 16,-8 L 38, -1 L 38, 12 L 16, 5 Z" fill="rgba(0, 242, 255, 0.4)" stroke="#fff" strokeWidth="0.5" />
            {/* Floating digital pulses */}
            <circle cx="20" cy="-2" r="1.5" fill="#fff" className="animate-pulse" />
            <circle cx="32" cy="4" r="1" fill={color} className="animate-bounce" />
          </g>
        );
      case 'workstation':
        return (
          <g transform={`rotate(${rotation}, 32, 16)`}>
            <polygon points="32,2 62,17 32,32 2,17" fill="rgba(255, 0, 200, 0.05)" stroke={color} strokeWidth="1" />
            {/* Table structure */}
            <path d="M 8,14 L 8,-12 L 56,12 L 56,38 Z" fill="rgba(255, 0, 200, 0.15)" stroke={color} strokeWidth="1.5" />
            {/* Holographic screens */}
            <polygon points="12,-6 24,-11 24,-2 12,3" fill="rgba(0, 242, 255, 0.5)" stroke="#00f2ff" strokeWidth="1" />
            <polygon points="26,-11 42,-14 42,-5 26,-2" fill="rgba(0, 242, 255, 0.6)" stroke="#00f2ff" strokeWidth="1" />
            <polygon points="44,-10 54,-7 54,2 44,-1" fill="rgba(255, 0, 200, 0.6)" stroke={color} strokeWidth="1" />
            {/* Neon keyboard */}
            <polygon points="24,10 38,15 32,18 18,13" fill="#fff" opacity="0.8" />
          </g>
        );
      case 'kotatsu':
        return (
          <g transform={`rotate(${rotation}, 32, 16)`}>
            <polygon points="32,2 62,17 32,32 2,17" fill="rgba(247, 103, 7, 0.15)" stroke={color} strokeWidth="1.5" />
            {/* The warm blanket */}
            <polygon points="32,-2 52,8 32,18 12,8" fill="rgba(247, 103, 7, 0.3)" stroke={color} strokeWidth="1" />
            {/* Table top */}
            <polygon points="32,-8 46,-1 32,6 18,-1" fill="rgba(247, 103, 7, 0.6)" stroke="#fff" strokeWidth="1.5" />
            {/* Steaming tea cup */}
            <path d="M 31,-11 Q 32,-13 33,-11 T 34,-9" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.8" className="animate-pulse" />
            <circle cx="32" cy="-9" r="1.5" fill="#FCC419" />
          </g>
        );
      case 'bonsai':
        return (
          <g transform={`rotate(${rotation}, 32, 16)`}>
            <polygon points="32,2 62,17 32,32 2,17" fill="none" stroke={color} strokeWidth="1" />
            {/* Metallic black pot */}
            <polygon points="32,8 44,14 32,20 20,14" fill="#1A1B26" stroke={color} strokeWidth="1.5" />
            {/* Twisted cyber trunk */}
            <path d="M 32,14 Q 28,2 35,-6" fill="none" stroke="#2C2E3E" strokeWidth="3" strokeLinecap="round" />
            {/* Pink glow polygonal foliage */}
            <circle cx="35" cy="-8" r="8" fill="rgba(255, 135, 135, 0.7)" stroke="#fff" strokeWidth="1.5" className="animate-pulse" />
            <polygon points="28,-14 36,-19 44,-10 32,-4" fill="rgba(255, 135, 135, 0.5)" />
          </g>
        );
      case 'sword_rack':
        return (
          <g transform={`rotate(${rotation}, 32, 16)`}>
            <polygon points="32,2 62,17 32,32 2,17" fill="none" stroke={color} strokeWidth="1" />
            {/* Stand */}
            <path d="M22,12 L38,18 L38,12 L22,6 Z" fill="#111" stroke={color} strokeWidth="1" />
            {/* Katanas */}
            <line x1="16" y1="-2" x2="48" y2="12" stroke="#ff00c8" strokeWidth="2.5" className="glow-pink animate-pulse" />
            <line x1="14" y1="4" x2="46" y2="18" stroke="#00f2ff" strokeWidth="2" className="glow-cyan" />
          </g>
        );
      case 'vocaloid_stage':
        return (
          <g transform={`rotate(${rotation}, 32, 16)`}>
            {/* Circular glowing stage */}
            <ellipse cx="32" cy="18" rx="20" ry="10" fill="rgba(32, 201, 151, 0.2)" stroke={color} strokeWidth="2" />
            {/* Holographic dancer projections */}
            <path d="M 32,18 L 32,-16" stroke="#fff" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.4" />
            <ellipse cx="32" cy="-12" rx="4" ry="2" fill="none" stroke="#20C997" strokeWidth="1" opacity="0.6" />
            {/* Hologram body avatar */}
            <g transform="translate(0, -6)" className="animate-bounce">
              <circle cx="32" cy="-8" r="3.5" fill="#20C997" stroke="#fff" />
              <path d="M 28,-2 L 36,-2 L 34,7 L 30,7 Z" fill="#20C997" opacity="0.8" />
              <line x1="28" y1="-2" x2="26" y2="-10" stroke="#20C997" strokeWidth="1.5" />
              <line x1="36" y1="-2" x2="38" y2="-10" stroke="#20C997" strokeWidth="1.5" />
            </g>
          </g>
        );
      case 'arcade':
        return (
          <g transform={`rotate(${rotation}, 32, 16)`}>
            <polygon points="32,2 62,17 32,32 2,17" fill="none" stroke={color} strokeWidth="1" />
            {/* Cabinet body */}
            <path d="M 16,10 L 16,-18 L 48,-6 L 48,22 Z" fill="rgba(252, 196, 25, 0.15)" stroke={color} strokeWidth="1.5" />
            {/* Screen */}
            <polygon points="22,-8 34,-12 34,-2 22,2" fill="#1e1e2e" stroke="#ff00c8" />
            {/* Joystick glowing red */}
            <circle cx="34" cy="8" r="2" fill="#E64980" />
            {/* Animated screen star */}
            <polygon points="28,-5 30,-2 32,-5 30,-8" fill="#fff" className="animate-pulse" />
          </g>
        );
      case 'aether_core':
        return (
          <g transform={`rotate(${rotation}, 32, 16)`}>
            <polygon points="32,2 62,17 32,32 2,17" fill="none" stroke={color} strokeWidth="1" />
            {/* Levitating obsidian socket */}
            <polygon points="32,10 44,15 32,20 20,15" fill="#1F2937" stroke={color} strokeWidth="1.5" />
            {/* Rotating central diamond */}
            <g className="animate-bounce">
              <polygon points="32,-12 40,-4 32,4 24,-4" fill="rgba(21, 170, 191, 0.7)" stroke="#fff" strokeWidth="1.5" />
              <line x1="32" y1="-12" x2="32" y2="4" stroke="#fff" strokeWidth="0.5" />
            </g>
            {/* Floating particle systems */}
            <circle cx="22" cy="-14" r="1" fill="#00f2ff" className="animate-calendar" />
            <circle cx="44" cy="-8" r="1.5" fill="#ff00c8" className="animate-ping" />
          </g>
        );
      case 'plush_sofa':
        return (
          <g transform={`rotate(${rotation}, 32, 16)`}>
            <polygon points="32,2 62,17 32,32 2,17" fill="rgba(166, 30, 77, 0.05)" stroke={color} strokeWidth="1" />
            {/* Cushions */}
            <path d="M 10,12 L 10,-8 L 54,10 L 54,30 Z" fill="rgba(166, 30, 77, 0.25)" stroke={color} strokeWidth="1.5" />
            <polygon points="14,0 48,14 36,19 18,12" fill="rgba(166, 30, 77, 0.4)" stroke="#fff" strokeWidth="0.5" />
            {/* Cute Neko heart cushion */}
            <circle cx="24" cy="5" r="3.5" fill="#fff" />
            <polygon points="21,2 24,0 23,4" fill="#ff00c8" />
            <polygon points="27,2 24,0 25,4" fill="#ff00c8" />
          </g>
        );
      default:
        return <polygon points="32,2 62,17 32,32 2,17" fill="rgba(255,255,255,0.05)" stroke="#fff" strokeWidth="1" />;
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Upper Panel: XP & Level Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core level rank card */}
        <div className="p-6 rounded-3xl glass border border-white/5 bg-gradient-to-br from-cyber-bg to-black/80 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-blue/5 rounded-full -mr-8 -mt-8 blur-3xl group-hover:bg-cyber-blue/10 transition-all" />
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyber-blue/15 border border-cyber-blue/30 flex items-center justify-center glow-blue text-cyber-blue relative font-display font-black text-xl">
              LV.{userLevel}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold font-display uppercase tracking-wider text-gray-400">大藏省級官 (Ledger Master)</h4>
              <p className="text-white text-md font-semibold mt-0.5">理財等極: 極致節能</p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-gray-500">
              <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-cyan-400" /> EXP PROGRES</span>
              <span>{userXP} / {xpNeededForNextLevel} XP</span>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (userXP / xpNeededForNextLevel) * 100)}%` }}
                className="h-full bg-gradient-to-r from-cyber-blue to-cyan-400 rounded-full"
              />
            </div>
            <p className="text-[10px] text-gray-500 font-mono text-right italic font-normal">
              PRO TIP: 記賬、節儉控制支出、增加月儲蓄率可賺取海量 XP 與金幣！
            </p>
          </div>
        </div>

        {/* Currency & Savings Rewards Card */}
        <div className="p-6 rounded-3xl glass border border-white/5 bg-gradient-to-br from-cyber-bg to-black/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyber-pink/5 rounded-full -mr-8 -mt-8 blur-3xl group-hover:bg-cyber-pink/10 transition-all" />
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-gray-500 font-mono tracking-widest block font-bold">AETHER COINS</span>
              <div className="text-4xl font-display font-black text-cyber-blue mt-1 flex items-baseline gap-1.5 glow-blue-text">
                {aetherCreds}
                <Coins className="w-5 h-5 text-yellow-400 ml-1" />
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white/5 text-gray-400 text-[10px] font-mono tracking-wider">
              SAVE CURRENCY
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="text-xs">
              <span className="text-gray-500 block text-[10px]">當前儲蓄溢價</span>
              <span className="font-bold text-green-400 font-mono">+{frugalStatus.savingsRate.toFixed(1)}% 紀律係數</span>
            </div>
            <button 
              disabled={streakClaimed}
              onClick={handleClaimCheckin}
              className={cn(
                "px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5 hover:scale-105",
                streakClaimed 
                  ? "bg-white/5 text-gray-500 border border-white/5" 
                  : "bg-cyber-blue text-black glow-blue"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" /> 
              {streakClaimed ? "今日已領" : `領取今日節算 (+${Math.max(15, frugalStatus.checkInClaimableCreds)}币)`}
            </button>
          </div>
        </div>

        {/* Current Active House Profile */}
        <div className="p-6 rounded-3xl glass border border-white/5 bg-gradient-to-br from-cyber-bg to-black/80 relative overflow-hidden group flex flex-col justify-between">
          <div>
            <span className="text-xs text-gray-500 font-mono tracking-widest block font-bold">MY HOME SANCTUARY</span>
            <h4 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
              <Home className="w-5 h-5 text-cyber-pink" /> 
              {activeHouse.name}
            </h4>
            <p className="text-xs text-gray-400 tracking-wider font-light mt-1.5 leading-relaxed">
              {activeHouse.description}
            </p>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-xs font-mono text-gray-500">
              GRID: {activeGridSize}x{activeGridSize} • PLACED: {placedFurniture.length} ITEMS
            </div>
            <div className="px-2.5 py-1 rounded bg-cyber-pink/15 text-cyber-pink border border-cyber-pink/30 font-display font-semibold text-[10px]">
              ON-DUTY
            </div>
          </div>
        </div>

      </div>

      {/* Main Interactive Screen Segment */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN (8 cols): 3D ISOMETRIC Virtual Room Builder */}
        <div className="xl:col-span-8 bg-black/90 p-6 md:p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group min-h-[550px] flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-blue via-cyber-pink to-cyber-blue" />
          
          {/* Virtual Builder Header Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 z-10">
             <div>
               <h3 className="text-lg font-display font-bold text-white flex items-center gap-1.5">
                 <Compass className="w-5 h-5 text-cyber-blue" /> 
                 以太三維量子居所 (3D Isometric Room)
               </h3>
               <p className="text-xs text-gray-500">
                 {placementMode ? "🔧 編輯模式：點擊格子放置傢俱。可調整旋轉或重構。" : "🕹️ 點擊已放置的傢俱可旋轉、移動或重構(收益包包)。"}
               </p>
             </div>
             
             {/* Mode Action controls */}
             <div className="flex items-center gap-4">
               {placementMode ? (
                 <div className="flex gap-2">
                   <button 
                     onClick={() => setGhostRotation((r => (r + 90) % 360))}
                     className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs hover:bg-white/10 transition-all flex items-center gap-1.5 font-bold"
                     title="旋轉"
                   >
                     <RotateCw className="w-3.5 h-3.5 text-cyber-blue" /> 旋轉 90°
                   </button>
                   <button 
                     onClick={() => {
                       setPlacementMode(false);
                       setSelectedBagItem(null);
                     }}
                     className="px-3.5 py-1.5 bg-cyber-pink/10 border border-cyber-pink/30 text-cyber-pink rounded-xl text-xs hover:bg-cyber-pink hover:text-white transition-all font-bold"
                   >
                     取消放置
                   </button>
                 </div>
               ) : (
                  <div className="text-[10px] text-gray-500 bg-white/5 px-3 py-1 rounded-full font-mono uppercase">
                     Active Grid Dimensions: {activeGridSize}x{activeGridSize}
                  </div>
               )}
             </div>
          </div>

          {/* Interactive Dynamic SVG Isometric Stage Panel */}
          <div className="relative w-full flex items-center justify-center py-10 overflow-x-auto select-none min-h-[380px]">
             {/* Ground Grid projection */}
             <svg 
               width={activeGridSize * 70 + 200} 
               height={activeGridSize * 35 + 260} 
               viewBox={`-${(activeGridSize * 35) + 60} -40 ${(activeGridSize * 75) + 120} ${(activeGridSize * 35) + 240}`}
               className="overflow-visible"
             >
               <defs>
                 <linearGradient id="sideWallLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="#1E0B2B" stopOpacity="0.95" />
                   <stop offset="100%" stopColor="#08020A" stopOpacity="0.95" />
                 </linearGradient>
                 <linearGradient id="sideWallRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="#0a1d26" stopOpacity="0.95" />
                   <stop offset="100%" stopColor="#02090C" stopOpacity="0.95" />
                 </linearGradient>
               </defs>

               <g transform="translate(0, 60)">
                 {/* Levitating 3D Cybernetic Block Base */}
                 <g opacity="0.92">
                   {/* Drop shadow underneath */}
                   <polygon 
                     points={`${-activeGridSize * 32 + 32},${activeGridSize * 16} ${activeGridSize * 32 + 32},${activeGridSize * 16} 32,${activeGridSize * 32 + 20}`}
                     fill="rgba(0,0,0,0.6)"
                     className="blur-md pointer-events-none"
                   />
                   
                   {/* Left front wall thickness */}
                   <polygon 
                     points={`${-activeGridSize * 32 + 32},${activeGridSize * 16} 32,${activeGridSize * 32} 32,${activeGridSize * 32 + 24} ${-activeGridSize * 32 + 32},${activeGridSize * 16 + 24}`}
                     fill="url(#sideWallLeftGrad)"
                     stroke="rgba(255, 0, 200, 0.45)"
                     strokeWidth="1.5"
                     className="pointer-events-none"
                   />

                   {/* Right front wall thickness */}
                   <polygon 
                     points={`${activeGridSize * 32 + 32},${activeGridSize * 16} 32,${activeGridSize * 32} 32,${activeGridSize * 32 + 24} ${activeGridSize * 32 + 32},${activeGridSize * 16 + 24}`}
                     fill="url(#sideWallRightGrad)"
                     stroke="rgba(0, 242, 255, 0.45)"
                     strokeWidth="1.5"
                     className="pointer-events-none"
                   />

                   {/* Absolute floor plate background */}
                   <polygon 
                     points={`32,2 ${activeGridSize * 32 + 32},${activeGridSize * 16} 32,${activeGridSize * 32} ${-activeGridSize * 32 + 32},${activeGridSize * 16}`}
                     fill="#0c0e18"
                     stroke="rgba(255, 255, 255, 0.15)"
                     strokeWidth="2"
                     className="pointer-events-none"
                   />
                 </g>

                 {/* Floor drawing */}
                 {Array.from({ length: activeGridSize }).map((_, x) => (
                   Array.from({ length: activeGridSize }).map((_, y) => {
                     const isGhostValid = placementMode && selectedBagItem && x === ghostX && y === ghostY;
                     const isGhostValidPlacement = isGhostValid && isValidPlacement(selectedBagItem!, x, y, ghostRotation);
                     
                     const pos = getIsometricPosition(x, y);
                     const isOffset = (x + y) % 2 === 0;

                     // Determine brilliant cyberpunk neon colors instead of dark opacity
                     const defaultFill = isOffset ? "rgba(0, 242, 255, 0.08)" : "rgba(255, 0, 200, 0.04)";
                     const defaultStroke = isOffset ? "rgba(0, 242, 255, 0.3)" : "rgba(255, 0, 200, 0.2)";

                     return (
                       <g 
                         key={`cell-${x}-${y}`} 
                         transform={`translate(${pos.x}, ${pos.y})`}
                         onClick={(e) => {
                           e.stopPropagation();
                           if (placementMode && selectedBagItem) {
                             const isThisValid = isValidPlacement(selectedBagItem, x, y, ghostRotation);
                             if (isThisValid) {
                               handleConfirmPlacement(x, y);
                             }
                           } else {
                             // Check if there is furniture on this cell
                             const occupierInstanceId = occupiedGrid[x][y];
                             if (occupierInstanceId) {
                               setEditingFurnitureId(editingFurnitureId === occupierInstanceId ? null : occupierInstanceId);
                             } else {
                               setEditingFurnitureId(null);
                             }
                           }
                         }}
                         onMouseEnter={() => {
                           if (placementMode) {
                             setGhostX(x);
                             setGhostY(y);
                           }
                         }}
                         className="cursor-pointer group/cell"
                       >
                         {/* Ground diamond tile with highly visible checker grid */}
                         <polygon 
                           points="32,2 62,17 32,32 2,17" 
                           fill={
                             isGhostValid
                               ? (isGhostValidPlacement ? "rgba(0, 242, 255, 0.45)" : "rgba(255, 0, 80, 0.45)")
                               : defaultFill
                           }
                           stroke={
                             isGhostValid 
                               ? (isGhostValidPlacement ? "#00f2ff" : "#ff0015")
                               : defaultStroke
                           }
                           strokeWidth={isGhostValid ? "1.5" : "1"}
                           className="transition-colors group-hover/cell:fill-white/10"
                         />
                         
                         {/* Cell coordinates text for geek styling */}
                         <text x="25" y="19" className="text-[7px] font-mono fill-white/20 opacity-0 group-hover/cell:opacity-100 transition-opacity">
                           {x},{y}
                         </text>
                       </g>
                     );
                   })
                 ))}

                 {/* Real Grid Placed Items rendering (with proper depth rendering) */}
                 {placedFurniture
                   .sort((a, b) => {
                     // Depth sort by isometric x+y coordinate! Crucial for correct overlaps!
                     const aSum = a.x + a.y;
                     const bSum = b.x + b.y;
                     if (aSum === bSum) return a.x - b.x;
                     return aSum - bSum;
                   })
                   .map(f => {
                     const pos = getIsometricPosition(f.x, f.y);
                     const isSelected = editingFurnitureId === f.id;

                     return (
                       <g 
                         key={f.id}
                         transform={`translate(${pos.x}, ${pos.y})`}
                         onClick={(e) => {
                           e.stopPropagation();
                           setEditingFurnitureId(editingFurnitureId === f.id ? null : f.id);
                         }}
                         className="cursor-pointer group/item"
                       >
                         {/* Placement Highlight */}
                         {isSelected && (
                           <g>
                             <polygon 
                               points="32,-2 66,15 32,36 -2,15" 
                               fill="none" 
                               stroke="#00f2ff" 
                               strokeWidth="1.5" 
                               className="animate-pulse" 
                             />
                             <line x1="32" y1="-2" x2="32" y2="-12" stroke="#00f2ff" strokeWidth="1" strokeDasharray="2,2" />
                           </g>
                         )}

                         {/* Shadow */}
                         <ellipse cx="32" cy="18" rx="20" ry="10" fill="rgba(0,0,0,0.3)" />

                         {/* Draw custom beautiful cyberpunk Vector */}
                         <g className={cn("transition-all duration-300", isSelected ? "-translate-y-2 scale-105" : "hover:-translate-y-1")}>
                            {renderItemSVG(f.itemId, f.rotation)}
                         </g>

                         {/* Mini Action buttons showing above selected item */}
                         {isSelected && (
                           <foreignObject x="-30" y="-55" width="124" height="40" className="overflow-visible select-none z-50">
                             <div className="flex gap-1.5 p-1 rounded-full bg-black/90 border border-cyber-blue/40 shadow-xl justify-center items-center">
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleRotatePlaced(f.id);
                                 }}
                                 className="p-1 rounded-full text-cyber-blue hover:bg-white/10 transition-colors"
                                 title="旋轉"
                               >
                                 <RotateCw className="w-3.5 h-3.5" />
                               </button>
                               <button 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleDeconstruct(f.id);
                                 }}
                                 className="p-1 rounded-full text-cyber-pink hover:bg-white/10 transition-colors"
                                 title="重構收回"
                               >
                                 <Trash2 className="w-3.5 h-3.5" />
                               </button>
                               <div className="w-[1px] h-3 bg-white/20" />
                               <span className="text-[9px] font-mono text-gray-400 pr-1 truncate max-w-[50px]">
                                 {FURNITURE_TEMPLATES.find(t => t.id === f.itemId)?.name.slice(0, 4)}
                               </span>
                             </div>
                           </foreignObject>
                         )}
                       </g>
                     );
                   })}

                 {/* Ghost Placement Silhouette Projection */}
                 {placementMode && selectedBagItem && (
                   <g transform={`translate(${getIsometricPosition(ghostX, ghostY).x}, ${getIsometricPosition(ghostX, ghostY).y})`} className="opacity-70 pointer-events-none">
                     <polygon points="32,-2 66,15 32,36 -2,15" fill="rgba(0, 242, 255, 0.15)" stroke="#00f2ff" />
                     {renderItemSVG(selectedBagItem, ghostRotation)}
                   </g>
                 )}
               </g>
             </svg>
          </div>

          {/* Quick Stats overview inside Home panel */}
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyber-pink/20 flex items-center justify-center text-cyber-pink">
                  <Zap className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-bold font-display">以太能效平衡 (Equilibrium)</div>
                  <div className="text-[10px] text-gray-500">本月平均開銷控制良率：{frugalStatus.savingsRate.toFixed(1)}%</div>
                </div>
             </div>
             <div className="text-right">
                <span className="text-xs text-gray-400 block">預算結餘</span>
                <span className="font-mono text-sm text-cyber-blue font-bold">{formatCurrency(frugalStatus.remaining)}</span>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols): Virtual Shop Catalogue & Inventory Bag */}
        <div className="xl:col-span-4 space-y-6">
          <div className="p-6 rounded-[2.5rem] glass border border-white/10 flex flex-col min-h-[550px] justify-between">
            
            {/* Tab Controllers */}
            <div>
              <div className="flex bg-black/40 border border-white/5 p-1 rounded-2xl gap-1 mb-6">
                <button 
                  onClick={() => {
                    setShopTab('buy_furniture');
                    setPlacementMode(false);
                  }}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1",
                    shopTab === 'buy_furniture' ? "bg-cyber-blue text-black" : "text-gray-400 hover:text-white"
                  )}
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> 傢俱商城
                </button>
                <button 
                  onClick={() => {
                    setShopTab('buy_house');
                    setPlacementMode(false);
                  }}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1",
                    shopTab === 'buy_house' ? "bg-cyber-blue text-black" : "text-gray-400 hover:text-white"
                  )}
                >
                  <Home className="w-3.5 h-3.5" /> 房屋買賣
                </button>
                <button 
                  onClick={() => setShopTab('bag')}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1",
                    shopTab === 'bag' ? "bg-cyber-blue text-black animate-pulse" : "text-gray-400 hover:text-white"
                  )}
                >
                  <Package className="w-3.5 h-3.5" /> 倉庫背包
                </button>
              </div>

              {/* TAB 1: Buy furniture */}
              {shopTab === 'buy_furniture' && (
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                  {FURNITURE_TEMPLATES.map(item => {
                    const isPurchased = purchasedFurniture.includes(item.id);
                    const isLevelOk = userLevel >= item.levelRequired;
                    const canAfford = aetherCreds >= item.price;

                    return (
                      <div 
                        key={item.id} 
                        className={cn(
                          "p-3 rounded-2xl bg-white/5 border transition-all flex justify-between items-center",
                          isLevelOk ? "border-white/5 hover:border-cyber-blue/30" : "border-white/5 opacity-50"
                        )}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">{item.name}</span>
                            <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 uppercase font-mono">{item.category}</span>
                          </div>
                          <p className="text-[10px] text-gray-500 pr-4 leading-relaxed font-light">{item.description}</p>
                          <div className="text-[9px] text-gray-400 font-mono">
                            尺碼: {item.width}x{item.height} 格子
                          </div>
                        </div>

                        <div className="text-right flex flex-col justify-between items-end h-full gap-2 pl-2">
                          <p className="text-cyber-blue font-mono font-bold text-xs flex items-center gap-1 shrink-0">
                            {item.price} <Coins className="w-3 h-3 text-yellow-400" />
                          </p>
                          
                          {isLevelOk ? (
                            <button 
                              disabled={!canAfford}
                              onClick={() => handleBuyFurniture(item)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                                canAfford 
                                  ? "bg-cyber-blue text-black shadow-md" 
                                  : "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
                              )}
                            >
                              購買
                            </button>
                          ) : (
                            <span className="text-[9px] text-cyber-pink font-semibold border border-cyber-pink/30 px-1.5 py-0.5 rounded bg-cyber-pink/5">
                              LV.{item.levelRequired} 解鎖
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: Buy house layout */}
              {shopTab === 'buy_house' && (
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                  {HOUSES.map(house => {
                    const isOwned = purchasedHouses.includes(house.id) || house.id === 'capsule';
                    const isCurrent = currentHouseId === house.id;
                    const isLevelOk = userLevel >= house.unlockedLevel;
                    const canAfford = aetherCreds >= house.price;

                    return (
                      <div 
                        key={house.id} 
                        className={cn(
                          "p-4 rounded-2xl bg-white/5 border flex flex-col gap-3",
                          isCurrent ? "border-cyber-blue/50 bg-cyber-blue/5" : "border-white/5 hover:border-white/10"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-xs flex items-center gap-2">
                              {house.name}
                              {isCurrent && <span className="text-[8px] px-1.5 py-0.5 rounded bg-cyber-blue/15 text-cyber-blue uppercase font-mono font-black">ACTIVE</span>}
                            </h4>
                            <p className="text-[10px] text-gray-500 leading-relaxed font-light mt-1">{house.description}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs font-mono text-gray-400 border-t border-white/5 pt-3">
                          <div>尺碼: {house.gridSize}x{house.gridSize}</div>
                          
                          <div className="flex items-center gap-3">
                            {!isOwned ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-cyber-blue font-bold">{house.price} 币</span>
                                {isLevelOk ? (
                                  <button 
                                    disabled={!canAfford}
                                    onClick={() => handleBuyHouse(house)}
                                    className={cn(
                                      "px-3 py-1 rounded bg-cyber-blue text-black font-bold font-sans",
                                      canAfford ? "opacity-100" : "opacity-30 cursor-not-allowed"
                                    )}
                                  >
                                    購買居所
                                  </button>
                                ) : (
                                  <span className="text-[8px] border border-cyber-pink/30 px-1 py-0.5 rounded text-cyber-pink font-sans">LV.{house.unlockedLevel}解鎖</span>
                                )}
                              </div>
                            ) : (
                              !isCurrent && (
                                <button 
                                  onClick={() => onUpdateSanctuary({ currentHouseId: house.id })}
                                  className="px-3 py-1 bg-white/10 text-white hover:bg-white rounded transition-colors font-sans font-bold"
                                >
                                  啟用切換
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 3: Bag Inventory and placing */}
              {shopTab === 'bag' && (
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                  {FURNITURE_TEMPLATES.map(item => {
                    const count = bagInventoryCounts[item.id] || 0;
                    if (count === 0) return null;

                    const isSelected = selectedBagItem === item.id;

                    return (
                      <div 
                        key={item.id} 
                        className={cn(
                          "p-3 rounded-2xl border transition-all flex justify-between items-center bg-white/5",
                          isSelected ? "border-cyber-blue shadow-lg bg-cyber-blue/5" : "border-white/5 hover:border-white/10"
                        )}
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-xs">{item.name}</div>
                          <p className="text-[10px] text-gray-500 pr-2">{item.description}</p>
                          <span className="text-[10px] text-cyan-400 font-mono">
                            背包庫存: x{count}
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            if (isSelected) {
                              setPlacementMode(false);
                              setSelectedBagItem(null);
                            } else {
                              handleStartPlacement(item.id);
                            }
                          }}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                            isSelected 
                              ? "bg-cyber-pink text-white" 
                              : "bg-white/5 border border-white/10 text-white hover:bg-cyber-blue hover:text-black hover:glow-blue"
                          )}
                        >
                          {isSelected ? "取消放置" : "放置空間"}
                        </button>
                      </div>
                    );
                  })}

                  {Object.values(bagInventoryCounts).every(c => c === 0) && (
                    <div className="text-center py-12 text-gray-500 space-y-4">
                      <div className="w-16 h-16 rounded-full border border-dashed border-white/10 flex items-center justify-center mx-auto text-gray-600">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="text-xs">您的背包當前空空如也</div>
                      <p className="text-[10px] leading-relaxed">前去傢俱店消費以太貨幣，購買您的第一批賽博飾品吧！</p>
                      <button 
                        onClick={() => setShopTab('buy_furniture')}
                        className="px-4 py-1.5 bg-cyber-blue/15 text-cyber-blue hover:bg-cyber-blue hover:text-black text-[10px] font-bold rounded-lg border border-cyber-blue/30 transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        前往商城 <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Quick Informational Box */}
            <div className="mt-8 bg-black/40 border border-white/5 p-4 rounded-3xl flex gap-3 items-start z-10 select-none">
              <Info className="w-4 h-4 text-cyber-blue shrink-0 mt-0.5 animate-pulse" />
              <div className="text-[10px] text-gray-500 leading-relaxed font-light">
                <span className="text-gray-400 font-semibold uppercase block pb-1">家園守則 & 收益說明</span>
                1. 每記錄一次加總收支賺取 <span className="text-cyber-blue font-bold">25 XP</span>。<br />
                2. 預算節律良好者隨時可在此頁領取大額 <span className="text-cyber-blue font-bold">Aether Coins</span> 收益。<br />
                3. 新居佈置完畢後更感心曠神怡，能有效引導理性消費觀念。
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
