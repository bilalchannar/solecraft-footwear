import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
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
import { OrderDetail, Orders } from "./pages/Orders";
import { AdminAnalytics, AdminBanners, AdminCategories, AdminContent, AdminCoupons, AdminCustomers, AdminDiscounts, AdminInventory, AdminOrders, AdminOverview, AdminProducts, AdminReviews, AdminReturns, AdminSettings } from "./pages/Admin";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
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
      <Route path={"/about"}>{() => <StaticPage title="Our craft" body="SoleCraft is a storefront built around transparent product details, considered footwear, and a connected delivery experience. Product materials, sizing, and availability are managed directly from the catalog." />}</Route>
      <Route path={"/shipping&returns"}>{() => <StaticPage title="Shipping & returns" body="Shipping information and return eligibility are presented with every order flow. Confirmed delivery timings, tracking, and return conditions are managed through the commerce administration experience." />}</Route>
      <Route path={"/size-guide"}>{() => <StaticPage title="Size guide" body="Select your usual size from the available product variants. For a closer fit recommendation, refer to the material and silhouette details shown on every product page." />}</Route>
      <Route path={"/contact"}>{() => <StaticPage title="Contact" body="For order support, delivery questions, or product information, contact the SoleCraft team using the support details managed by the store administrator." />}</Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

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
