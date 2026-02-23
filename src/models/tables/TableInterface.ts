
interface TableInterface {
    name: string; // Nom de la table
    plusAction: boolean; // Permet de savoir si la table à besoin d'un bouton plus
    head: string[]; // Champs pour l'entête
    lines: null|string[][]; // Données associées au head
    more : null|string[]; // Champs moins important visible dans les détails
    moreLines : null|string[]; // Données associées au more
    listOptions : null|string[][]; // Liste des options sur une ligne. Les options ont un modal (appel de la fonction), un texte pour le bouton, un icone
}
export default TableInterface;