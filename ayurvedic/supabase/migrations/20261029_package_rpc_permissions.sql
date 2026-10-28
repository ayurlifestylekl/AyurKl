-- =====================================================================
-- Lock down redeem_package_session (2026-10-29, part 4)
-- =====================================================================
-- Postgres grants EXECUTE on new functions to PUBLIC by default, so the anon
-- and authenticated API roles could call this SECURITY DEFINER function
-- directly and redeem sessions on any purchase whose id they knew (ids appear
-- in receipt links). Staff redeem through the server's service-role client
-- (requireStaff → redeemPackageSession), so only service_role needs it.
--
-- Safe to re-run. Apply via Supabase SQL Editor.
-- =====================================================================

REVOKE EXECUTE ON FUNCTION public.redeem_package_session(UUID, UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.redeem_package_session(UUID, UUID, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_package_session(UUID, UUID, TEXT) TO service_role;
