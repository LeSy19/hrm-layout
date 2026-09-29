'use client'

interface LeaveTypeHeaderProps {
    onRefresh: () => void;
    onOpenLeaveTypeDrawer: () => void;
}

const LeaveTypeHeader = ({ onRefresh, onOpenLeaveTypeDrawer }: LeaveTypeHeaderProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Quản Lý Loại Phép</h1>
                <p className="text-sm text-gray-500">Danh sách và thông tin loại phép trong hệ thống</p>
            </div>

            <div className="flex items-center gap-3">
                {/* Nút Refresh */}
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    ↻ Refresh
                </button>

                {/* Nút Thêm mới */}
                <button
                    onClick={onOpenLeaveTypeDrawer}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    + Thêm loại phép
                </button>
            </div>
        </div>
    );
};
export default LeaveTypeHeader;