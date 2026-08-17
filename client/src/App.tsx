import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import StaticPage from "./pages/StaticPage";
import Account from "./pages/Account";
import Addresses from "./pages/Addresses";
import Wishlist from "./pages/Wishlist";
import SizeGuide from "./pages/SizeGuide";
import Shipping from "./pages/Shipping";
import Contact from "./pages/Contact";
import About from "./pages/About";
import { OrderDetail, Orders } from "./pages/Orders";
import {
  AdminAnalytics,
  AdminBanners,
  AdminCategories,
  AdminContent,
  AdminCoupons,
  AdminCustomers,
  AdminDiscounts,
  AdminInventory,
  AdminOrders,
  AdminOverview,
  AdminProducts,
  AdminReviews,
  AdminReturns,
  AdminSettings,
} from "./pages/Admin";
import { luxuryEase } from "./lib/motion";

function Router() {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.28, ease: luxuryEase }}
        className="w-full flex-1 flex flex-col"
      >
        <Switch location={location}>
          <Route path={"/"} component={Home} />
          <Route path={"/shop"} component={Shop} />
          <Route path={"/product/:slug"} component={ProductDetail} />
          <Route path={"/cart"} component={Cart} />
          <Route path={"/checkout"} component={Checkout} />
          <Route path={"/account"} component={Account} />
          <Route path={"/account/addresses"} component={Addresses} />
          <Route path={"/account/orders/:publicId"} component={OrderDetail} />
          <Route path={"/account/orders"} component={Orders} />
          <Route path={"/wishlist"} component={Wishlist} />
          <Route path={"/admin"} component={AdminOverview} />
          <Route path={"/admin/products"} component={AdminProducts} />
          <Route path={"/admin/categories"} component={AdminCategories} />
          <Route path={"/admin/inventory"} component={AdminInventory} />
          <Route path={"/admin/orders"} component={AdminOrders} />
          <Route path={"/admin/returns"} component={AdminReturns} />
          <Route path={"/admin/coupons"} component={AdminCoupons} />
          <Route path={"/admin/discounts"} component={AdminDiscounts} />
          <Route path={"/admin/banners"} component={AdminBanners} />
          <Route path={"/admin/customers"} component={AdminCustomers} />
          <Route path={"/admin/reviews"} component={AdminReviews} />
          <Route path={"/admin/content"} component={AdminContent} />
          <Route path={"/admin/analytics"} component={AdminAnalytics} />
          <Route path={"/admin/settings"} component={AdminSettings} />
          <Route path={"/about"} component={About} />
          <Route path={"/our-craft"} component={About} />
          <Route path={"/shipping"} component={Shipping} />
          <Route path={"/shipping&returns"} component={Shipping} />
          <Route path={"/delivery"} component={Shipping} />
          <Route path={"/size-guide"} component={SizeGuide} />
          <Route path={"/contact"} component={Contact} />
          <Route path={"/support"} component={Contact} />
          <Route path={"/404"} component={NotFound} />
          {/* Final fallback route */}
          <Route component={NotFound} />
        </Switch>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
