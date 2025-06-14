# 🏦 Simulateur d'Options Forex - FX Strategy Simulator

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

> **Simulateur avancé d'options de change développé durant mon stage**  
> Outil professionnel pour l'analyse et la simulation de stratégies FX complexes

## 🎯 **Vue d'Ensemble**

Ce simulateur d'options Forex est une application web sophistiquée permettant aux traders et gestionnaires de risque d'analyser, tester et optimiser leurs stratégies de change. Développé avec des modèles de pricing financiers avancés et une interface utilisateur moderne.

## ✨ **Fonctionnalités Principales**

### 📊 **Modèles de Pricing Avancés**
- **Garman-Kohlhagen** : Modèle spécialisé pour options FX
- **Black-Scholes** : Options vanilles classiques
- **Monte Carlo** : Simulations pour options barrières
- **Forme fermée** : Calculs analytiques pour options digitales

### 🎭 **Types d'Options Supportés**
- **Options Vanilles** : Call/Put classiques
- **Options Barrières** : Knock-Out/Knock-In (simple et double)
- **Options Digitales** : One-Touch, No-Touch, Double-Touch
- **Contrats Forward/Swap** : Instruments de change

### 🔍 **Fonctionnalités d'Analyse**
- **Matrice de Risque** : Analyse multi-stratégies
- **Tests de Stress** : Scénarios de crise et volatilité
- **Backtesting Historique** : Performance sur données passées
- **Visualisations Bloomberg-like** : Charts professionnels
- **Export PDF** : Rapports détaillés

## 🛠️ **Technologies Utilisées**

```json
{
  "Frontend": ["React 18", "TypeScript", "Vite"],
  "UI/UX": ["Tailwind CSS", "shadcn/ui", "Radix UI"],
  "Visualisation": ["Recharts", "Chart.js"],
  "State Management": ["React Query", "Local Storage"],
  "Routing": ["React Router DOM"],
  "Export": ["jsPDF", "html2canvas"],
  "Finance": ["Modèles de pricing", "Monte Carlo", "Greeks"]
}
```

## 🚀 **Installation & Démarrage**

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation
```bash
# Cloner le repository
git clone https://github.com/bfaress22/zero-start-sketchpad.git

# Naviguer dans le dossier
cd zero-start-sketchpad

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📈 **Captures d'Écran**

### Interface Principale
![Dashboard](https://via.placeholder.com/800x400/1f2937/ffffff?text=FX+Options+Dashboard)

### Matrice de Risque
![Risk Matrix](https://via.placeholder.com/800x400/065f46/ffffff?text=Risk+Matrix+Analysis)

### Graphiques de Payoff
![Payoff Charts](https://via.placeholder.com/800x400/7c3aed/ffffff?text=Professional+Payoff+Charts)

## 💼 **Cas d'Usage**

- **Traders Institutionnels** : Analyse de stratégies complexes
- **Gestionnaires de Risque** : Évaluation de portefeuilles
- **Éducation Financière** : Compréhension des options FX
- **Recherche Quantitative** : Tests de modèles

## 🔧 **Fonctionnalités Techniques**

### Calculs FX Spécialisés
```typescript
// Prix Forward FX
forward = spot * exp((domesticRate - foreignRate) * timeToMaturity)

// Modèle Garman-Kohlhagen
// Prend en compte les taux domestique ET étranger
```

### Types de Stratégies
- Protective Put/Call
- Collar Zero-Cost
- Straddle/Strangle
- Iron Condor
- Butterfly Spreads
- Stratégies personnalisées

## 📊 **Métriques du Projet**

- **7000+** lignes de code TypeScript/React
- **15+** types d'options financières
- **4** modèles de pricing implémentés
- **20+** paires de devises supportées
- **Interface responsive** multi-plateformes

## 🤝 **Développé Durant Mon Stage**

Ce projet a été développé dans le cadre de mon stage en développement financier, démontrant :
- Maîtrise des concepts financiers avancés
- Compétences en développement frontend moderne
- Capacité à créer des outils professionnels
- Intégration de modèles mathématiques complexes

## 📝 **Licence**

Ce projet est développé à des fins éducatives et professionnelles.

---

**Développé avec ❤️ durant mon stage - Simulateur FX Professionnel**