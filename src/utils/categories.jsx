import {
  ShirtIcon,
  ShoppingBag,
  Package,
  Save,
  Search,
} from "lucide-react";
import { PiPants, PiHoodie, PiBaseballCapDuotone  } from "react-icons/pi";
import { IoShirtOutline } from "react-icons/io5";



export const CATEGORIES = [
  {
    slug: "remeras",
    label: "Remeras",
    icon: IoShirtOutline,
    iconSize: 18,
  },

  {
    slug: "pantalones",
    label: "Pantalones",
    icon: PiPants,
    iconSize: 18,
  },
  {
    slug: "camperas",
    label: "Camperas",
    icon: PiHoodie,
    iconSize: 18,
  },
  {
    slug: "accesorios",
    label: "Accesorios",
    icon: PiBaseballCapDuotone,
    iconSize: 18,
  },
];
