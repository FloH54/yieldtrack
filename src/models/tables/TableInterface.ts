
interface TableInterface {
    name: string; // Nom de la table
    head: string[]; // Champs pour l'entête
    lines: null|string[][]; // Données associées au head
    more : null|string[] // Champs moins important visible dans les détails
    moreLines : null|string[][]; // Données associées au more
    createAction?: TableAction | null; // Action de création de l'instance
    rowActions?: TableAction[] | null; // Actions possible sur une instance

}
export default TableInterface;

export interface TableAction {
    label: string;
    icon: string;
    modalTarget?: string; // Ex: '#createTaskModal'
    url?: string;         // Ex: '/tasks/new' (si tu ne veux pas de modal)
}