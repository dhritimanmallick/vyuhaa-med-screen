#!/bin/bash
# ============================================================
# EC2 Branch Setup Script
# Run this ONLY on the EC2-Branch to swap Supabase files
# with their EC2 equivalents.
# ============================================================

set -e

echo "🔄 Swapping hooks to EC2 versions..."

# Auth hooks
mv src/hooks/useAuth.ts src/hooks/useAuth.supabase.ts 2>/dev/null || true
cp src/hooks/useAuth.ec2.ts src/hooks/useAuth.ts

# Data hooks
for hook in useSamples usePatients useCustomers usePricingTiers useBillingRecords useTestResults useLabLocations useUsers; do
  if [ -f "src/hooks/${hook}.ec2.ts" ]; then
    mv "src/hooks/${hook}.ts" "src/hooks/${hook}.supabase.ts" 2>/dev/null || true
    cp "src/hooks/${hook}.ec2.ts" "src/hooks/${hook}.ts"
    echo "  ✓ ${hook}"
  fi
done

echo "🔄 Swapping auth components to EC2 versions..."

mv src/components/auth/AuthGuard.tsx src/components/auth/AuthGuard.supabase.tsx 2>/dev/null || true
cp src/components/auth/AuthGuard.ec2.tsx src/components/auth/AuthGuard.tsx

mv src/components/auth/LoginForm.tsx src/components/auth/LoginForm.supabase.tsx 2>/dev/null || true
cp src/components/auth/LoginForm.ec2.tsx src/components/auth/LoginForm.tsx

echo "🔄 Swapping Index page to EC2 version..."

mv src/pages/Index.tsx src/pages/Index.supabase.tsx 2>/dev/null || true
cp src/pages/Index.ec2.tsx src/pages/Index.tsx

echo "🔄 Replacing SlideImageUploader..."

mv src/components/dashboard/technician/SlideImageUploader.tsx \
   src/components/dashboard/technician/SlideImageUploader.supabase.tsx 2>/dev/null || true
cp src/lib/ec2/SlideImageUploader.tsx \
   src/components/dashboard/technician/SlideImageUploader.tsx

echo ""
echo "✅ EC2 branch setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review the changes: git diff"
echo "  2. Build: npm run build"
echo "  3. Deploy dist/ to your EC2 nginx"
echo ""
