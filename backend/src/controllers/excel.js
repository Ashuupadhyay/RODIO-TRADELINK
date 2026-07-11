const ExcelJS = require("exceljs");
const Query = require("../models/queryform");

const exportExcel = async (req, res) => {
    try {
        const data = await Query.find();

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Queries");

        worksheet.columns = [
            { header: "Name", key: "name", width: 25 },
            { header: "Email", key: "email", width: 30 },
            { header: "Phone", key: "phone", width: 20 },
            { header: "Message", key: "message", width: 40 },
        ];

        data.forEach(item => {
            worksheet.addRow({
                name: item.name,
                email: item.email,
                phone: item.phone,
                message: item.message,
            });
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=queries.xlsx"
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = { exportExcel };