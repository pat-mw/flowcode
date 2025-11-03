'use client';
import { NavigationWrapper } from "@/src/libraries/core/components/Navigation.webflow";
import LaserFlow from "@/components/react-bits/laser-flow/LaserFlow";
import LaserFlowBoxExample from "@/components/react-bits/laser-flow/hero";

export default function LaserFlowPage() {
    return (
    <div className="min-h-screen flex flex-col w-screen">
      <NavigationWrapper
        brandName="BlogFlow"
        homeUrl="/"
        showAuthButtons={true}
        loginUrl="/login"
        registerUrl="/register"
        variant="default"
      />

        <LaserFlowBoxExample />
    </div>
  );
}