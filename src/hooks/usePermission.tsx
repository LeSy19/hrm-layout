"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { permissionService } from "@/service/permission.service";
import type { MyPermission } from "@/interfaces/permission.interface";
import { hasEndpointPermission } from "@/utils/permission.util";

interface PermissionContextValue {
  loading: boolean;
  isAdmin: boolean;
  permissions: MyPermission[];
  /** can("DELETE", EndPoint.Employees.DeleteEmployee(id)) */
  can: (method: string, path: string) => boolean;
  /** Nạp lại quyền (gọi sau khi admin vừa sửa quyền của chính role mình) */
  refresh: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextValue | null>(null);

export const PermissionProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [permissions, setPermissions] = useState<MyPermission[]>([]);

  const refresh = useCallback(async () => {
    try {
      const data = await permissionService.getMyPermissions();
      setIsAdmin(!!data.isAdmin);
      setPermissions(data.permissions ?? []);
    } catch {
      setIsAdmin(false);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const can = useCallback(
    (method: string, path: string) => isAdmin || hasEndpointPermission(permissions, method, path),
    [isAdmin, permissions]
  );

  const value = useMemo(
    () => ({ loading, isAdmin, permissions, can, refresh }),
    [loading, isAdmin, permissions, can, refresh]
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
};

export const usePermission = (): PermissionContextValue => {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error("usePermission phải dùng bên trong <PermissionProvider>");
  return ctx;
};

/**
 * Ẩn phần tử nếu user không có quyền gọi endpoint.
 * <Can method="DELETE" path={EndPoint.Employees.DeleteEmployee(row.id)}><Button>Xóa</Button></Can>
 */
export const Can = ({
  method,
  path,
  children,
  fallback = null,
}: {
  method: string;
  path: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const { can } = usePermission();
  return <>{can(method, path) ? children : fallback}</>;
};
