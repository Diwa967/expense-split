// utils/generateAdminReport.js

// ─── Lazy load PDF libs ─────────────────────────────
const loadPdfLibs = async () => {
    const [jsPDFModule, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
    ]);

    const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
    const autoTable = autoTableModule.default;

    return { jsPDF, autoTable };
};

// ─── Helpers ────────────────────────────────────────
const fmt = (n) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(n);

const fmtDate = (iso) =>
    iso
        ? new Date(iso).toLocaleDateString("en-US", { dateStyle: "medium" })
        : "—";

// ─── Main export function ───────────────────────────
export async function generateAdminReport(data) {
    const { jsPDF, autoTable } = await loadPdfLibs();

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const PAGE_W = doc.internal.pageSize.getWidth();
    const MARGIN = 16;

    const TEXT = [30, 41, 59];
    const MUTED = [100, 116, 139];
    const BORDER = [226, 232, 240];
    const PRIMARY = [59, 130, 246];

    let y = 20;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...TEXT);
    doc.text("Admin Report", MARGIN, y);

    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(
        `Generated: ${new Date(data.generatedAt).toLocaleString()}`,
        MARGIN,
        y + 6
    );

    y += 14;

    const divider = () => {
        doc.setDrawColor(...BORDER);
        doc.line(MARGIN, y, PAGE_W - MARGIN, y);
        y += 8;
    };

    const sectionTitle = (title) => {
        if (y > 260) {
            doc.addPage();
            y = 20;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...PRIMARY);
        doc.text(title, MARGIN, y);

        y += 6;
        divider();
    };

    const addTable = (columns, rows) => {
        autoTable(doc, {
            startY: y,
            margin: { left: MARGIN, right: MARGIN },
            head: [columns.map((c) => c.header)],
            body: rows.map((r) => columns.map((c) => r[c.key] ?? "—")),
            styles: {
                fontSize: 8,
                cellPadding: 3,
                textColor: TEXT,
                lineColor: BORDER,
            },
            headStyles: {
                fillColor: [245, 247, 250],
                textColor: TEXT,
                fontStyle: "bold",
            },
            alternateRowStyles: { fillColor: [250, 250, 250] },
        });

        y = doc.lastAutoTable.finalY + 10;
    };

    // Summary
    sectionTitle("Summary");
    [
        ["Users", data.summary.totalUsers],
        ["Groups", data.summary.totalGroups],
        ["Expenses", data.summary.totalExpenses],
        ["Total Spent", fmt(data.summary.totalSpent)],
    ].forEach((s, i) => {
        doc.setFontSize(9);
        doc.setTextColor(...MUTED);
        doc.text(s[0], MARGIN + i * 45, y);

        doc.setFontSize(12);
        doc.setTextColor(...TEXT);
        doc.text(String(s[1]), MARGIN + i * 45, y + 6);
    });

    y += 16;

    // Category
    sectionTitle("Category Breakdown");
    addTable(
        [
            { header: "Category", key: "category" },
            { header: "Count", key: "count" },
            { header: "Total", key: "total" },
        ],
        data.categoryBreakdown.map((c) => ({
            category: c._id || "Uncategorised",
            count: c.count,
            total: fmt(c.total),
        }))
    );

    // Users
    sectionTitle("Users");
    addTable(
        [
            { header: "#", key: "idx" },
            { header: "Name", key: "name" },
            { header: "Email", key: "email" },
            { header: "Spent", key: "totalSpent" },
        ],
        data.users.map((u, i) => ({
            idx: i + 1,
            name: u.name,
            email: u.email,
            totalSpent: fmt(u.totalSpent),
        }))
    );

    // Groups
    sectionTitle("Groups");
    addTable(
        [
            { header: "#", key: "idx" },
            { header: "Name", key: "name" },
            { header: "Members", key: "totalMembers" },
            { header: "Expenses", key: "totalExpenses" },
            { header: "Total Spent", key: "totalSpent" },
            { header: "Created", key: "createdAt" },
        ],
        data.groups.map((g, i) => ({
            idx: i + 1,
            name: g.name,
            totalMembers: g.totalMembers,
            totalExpenses: g.totalExpenses,
            totalSpent: fmt(g.totalSpent),
            createdAt: fmtDate(g.createdAt),
        }))
    );


    // Expenses
    sectionTitle("Recent Expenses");
    addTable(
        [
            { header: "#", key: "idx" },
            { header: "Title", key: "title" },
            { header: "Category", key: "category" },
            { header: "Group", key: "groupName" },
            { header: "Paid By", key: "paidBy" },
            { header: "Amount", key: "amount" },
            { header: "Date", key: "createdAt" },
        ],
        data.expenses.map((e, i) => ({
            idx: i + 1,
            title: e.title,
            category: e.category || "—",
            groupName: e.groupName,
            paidBy: e.paidBy,
            amount: fmt(e.amount),
            createdAt: fmtDate(e.createdAt),
        }))
    );

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        doc.text(`Page ${p}`, PAGE_W - MARGIN, 290, { align: "right" });
    }

    const dateStr = new Date().toISOString().split("T")[0];
    doc.save(`admin-report-${dateStr}.pdf`);
}