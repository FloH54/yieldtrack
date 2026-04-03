import { Request, Response } from 'express';
import { Units, Codes, Task, RWs, UserToUnits, ContractHours } from "../models/Index";

const isAdmin = (user: any) => {
    if (!user || !user.profiles) return false;
    return user.profiles.some((profile: any) => {
        const roleName = profile.profileName || profile.ProfileName || profile.name;
        return roleName === 'Administrateur';
    });
};

// --- CONFIGURATION DES COLONNES POUR LES VUES ---
export const UNITS_ADMIN_COLUMNS = [
    { id: 'unitId', label: "ID" },
    { id: 'unitName', label: "Unit Name" },
    { id: 'fatherUnitName', label: "Father Unit" },
    { id: 'actions', label: "Actions" }
];

export const CODES_ADMIN_COLUMNS = [
    { id: 'codeId', label: "ID" },
    { id: 'codeName', label: "Code Name" },
    { id: 'actions', label: "Actions" }
];

// ==========================================
// RENDU DES PAGES (GET)
// ==========================================

export const renderUnitsAdminPage = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!isAdmin(user)) return res.status(403).render('404', { user, message: "Access denied." });

        const TABLE_ID = 'adminUnitsTable';
        const selectedColumns = (req as any).tablePreferences?.[TABLE_ID] || ['unitId', 'unitName', 'fatherUnitName', 'actions'];

        const allUnits = await Units.findAll();

        res.render('Pages/adminUnits', {
            user,
            allUnits: allUnits.map(u => u.get({ plain: true })),
            tableId: TABLE_ID,
            tableTitle: "Units Management",
            allColumns: UNITS_ADMIN_COLUMNS,
            selectedColumns,
            currentUrl: req.originalUrl,
            createAction: { label: "New Unit", icon: "fas fa-plus", modalTarget: "#createUnitModal" }
        });
    } catch (error) {
        console.error("Error rendering units admin page:", error);
        res.status(500).send("Server error");
    }
};

export const renderCodesAdminPage = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!isAdmin(user)) return res.status(403).render('404', { user, message: "Access denied." });

        const TABLE_ID = 'adminCodesTable';
        const selectedColumns = (req as any).tablePreferences?.[TABLE_ID] || ['codeId', 'codeName', 'actions'];

        res.render('Pages/adminCodes', {
            user,
            tableId: TABLE_ID,
            tableTitle: "Blockage Codes Management",
            allColumns: CODES_ADMIN_COLUMNS,
            selectedColumns,
            currentUrl: req.originalUrl,
            createAction: { label: "New Code", icon: "fas fa-plus", modalTarget: "#createCodeModal" }
        });
    } catch (error) {
        console.error("Error rendering codes admin page:", error);
        res.status(500).send("Server error");
    }
};

// ==========================================
// ROUTES API POUR DATATABLES (Lecture)
// ==========================================

export const getUnitsData = async (req: Request, res: Response) => {
    try {
        const allUnits = await Units.findAll();
        const plainUnits = allUnits.map(u => u.get({ plain: true }));

        const data = plainUnits.map(u => {
            const father = plainUnits.find(f => (f.UnitId || f.unitId) === (u.FatherUnitId || u.fatherUnitId));
            return {
                unitId: u.UnitId || u.unitId,
                unitName: u.UnitName || u.unitName,
                fatherUnitId: u.FatherUnitId || u.fatherUnitId,
                fatherUnitName: father ? (father.UnitName || father.unitName) : null
            };
        });
        res.json({ data });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
};

export const getCodesData = async (req: Request, res: Response) => {
    try {
        const allCodes = await Codes.findAll();
        const data = allCodes.map(c => ({
            codeId: c.CodeId || c.codeId,
            codeName: c.CodeName || c.codeName
        }));
        res.json({ data });
    } catch (error) {
        res.status(500).json({ error: "Error fetching data" });
    }
};

// ==========================================
// API CRUD : UNITS
// ==========================================

export const createUnit = async (req: Request, res: Response) => {
    try {
        if (!isAdmin((req as any).user)) return res.status(403).json({ error: "Only administrators can perform this action." });

        const { unitName, fatherUnitId } = req.body;
        await Units.create({
            unitName,
            fatherUnitId: fatherUnitId ? parseInt(fatherUnitId) : null
        });

        res.status(200).json({ success: true, message: "Unit created successfully." });
    } catch (error) {
        console.error("Error creating unit:", error);
        res.status(500).json({ error: "Error while creating the unit." });
    }
};

export const updateUnit = async (req: Request, res: Response) => {
    try {
        if (!isAdmin((req as any).user)) return res.status(403).json({ error: "Only administrators can perform this action." });

        const { id, unitName, fatherUnitId } = req.body;
        const unit = await Units.findByPk(id);

        if (!unit) return res.status(404).json({ error: "Unit not found." });

        if (parseInt(id) === parseInt(fatherUnitId)) {
            return res.status(400).json({ error: "A unit cannot be its own parent." });
        }

        await unit.update({
            unitName,
            fatherUnitId: fatherUnitId ? parseInt(fatherUnitId) : null
        });

        res.status(200).json({ success: true, message: "Unit updated successfully." });
    } catch (error) {
        console.error("Error updating unit:", error);
        res.status(500).json({ error: "Error while updating the unit." });
    }
};

export const deleteUnit = async (req: Request, res: Response) => {
    try {
        if (!isAdmin((req as any).user)) return res.status(403).json({ error: "Only administrators can perform this action." });

        const { id } = req.body;
        const unit = await Units.findByPk(id);

        if (!unit) return res.status(404).json({ error: "Unit not found." });

        await Units.update({ fatherUnitId: null }, { where: { fatherUnitId: id } });
        await Task.update({ unitId: null }, { where: { unitId: id } });
        await UserToUnits.destroy({ where: { unitId: id } });
        await ContractHours.destroy({ where: { unitId: id } });
        await unit.destroy();

        res.status(200).json({ success: true, message: "Unit deleted successfully." });
    } catch (error) {
        console.error("Error deleting unit:", error);
        res.status(500).json({ error: "Cannot delete this unit due to a server error." });
    }
};

// ==========================================
// API CRUD : CODES
// ==========================================

export const createCode = async (req: Request, res: Response) => {
    try {
        if (!isAdmin((req as any).user)) return res.status(403).json({ error: "Only administrators can perform this action." });

        const { codeName } = req.body;
        await Codes.create({ codeName });

        res.status(200).json({ success: true, message: "Code created successfully." });
    } catch (error) {
        console.error("Error creating code:", error);
        res.status(500).json({ error: "Error while creating the code." });
    }
};

export const updateCode = async (req: Request, res: Response) => {
    try {
        if (!isAdmin((req as any).user)) return res.status(403).json({ error: "Only administrators can perform this action." });

        const { id, codeName } = req.body;
        const code = await Codes.findByPk(id);

        if (!code) return res.status(404).json({ error: "Code not found." });

        await code.update({ codeName });

        res.status(200).json({ success: true, message: "Code updated successfully." });
    } catch (error) {
        console.error("Error updating code:", error);
        res.status(500).json({ error: "Error while updating the code." });
    }
};

export const deleteCode = async (req: Request, res: Response) => {
    try {
        if (!isAdmin((req as any).user)) return res.status(403).json({ error: "Only administrators can perform this action." });

        const { id } = req.body;
        const code = await Codes.findByPk(id);

        if (!code) return res.status(404).json({ error: "Code not found." });

        await Task.update({ codeId: null }, { where: { codeId: id } });
        await RWs.update({ codeId: null }, { where: { codeId: id } });
        await code.destroy();

        res.status(200).json({ success: true, message: "Code deleted successfully." });
    } catch (error) {
        console.error("Error deleting code:", error);
        res.status(500).json({ error: "Cannot delete this code due to a server error." });
    }
};