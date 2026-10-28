export interface ScientificConstant {
  symbol: string;
  name: string;
  category: 'Universal' | 'Atomic & Nuclear' | 'Electromagnetic' | 'Astrophysics' | 'Physico-Chemical' | 'Mathematics';
  value: string;
  unit: string;
  description: string;
}

export const EXTENDED_CONSTANTS_LIST: ScientificConstant[] = [
  // --- UNIVERSAL CONSTANTS ---
  { symbol: 'c', name: 'Speed of Light in Vacuum', category: 'Universal', value: '299792458', unit: 'm/s', description: 'Exact speed of electromagnetic radiation in free space' },
  { symbol: 'h', name: "Planck's Constant", category: 'Universal', value: '6.62607015e-34', unit: 'J⋅s', description: 'Fundamental quantum of action in physics' },
  { symbol: 'ħ', name: 'Reduced Planck Constant (Dirac)', category: 'Universal', value: '1.054571817e-34', unit: 'J⋅s', description: 'Planck constant divided by 2π' },
  { symbol: 'G', name: 'Newtonian Gravitational Constant', category: 'Universal', value: '6.67430e-11', unit: 'm³/(kg⋅s²)', description: 'Empirical physical constant in gravitation laws' },
  { symbol: 'g', name: 'Standard Earth Gravitational Acceleration', category: 'Universal', value: '9.80665', unit: 'm/s²', description: 'Standard acceleration due to Earth gravity at sea level' },

  // --- ATOMIC & NUCLEAR ---
  { symbol: 'e', name: 'Elementary Electric Charge', category: 'Atomic & Nuclear', value: '1.602176634e-19', unit: 'C', description: 'Electric charge carried by single proton' },
  { symbol: 'm_e', name: 'Electron Rest Mass', category: 'Atomic & Nuclear', value: '9.1093837015e-31', unit: 'kg', description: 'Static invariant mass of an electron' },
  { symbol: 'm_p', name: 'Proton Rest Mass', category: 'Atomic & Nuclear', value: '1.67262192369e-27', unit: 'kg', description: 'Static invariant mass of a proton' },
  { symbol: 'm_n', name: 'Neutron Rest Mass', category: 'Atomic & Nuclear', value: '1.67492749804e-27', unit: 'kg', description: 'Static invariant mass of a neutron' },
  { symbol: 'm_u', name: 'Atomic Mass Constant (Dalton)', category: 'Atomic & Nuclear', value: '1.66053906660e-27', unit: 'kg', description: 'One twelfth of mass of unbound carbon-12 atom' },
  { symbol: 'a₀', name: 'Bohr Radius', category: 'Atomic & Nuclear', value: '5.29177210903e-11', unit: 'm', description: 'Most probable distance between proton and electron in hydrogen' },
  { symbol: 'E_h', name: 'Hartree Energy', category: 'Atomic & Nuclear', value: '4.3597447222071e-18', unit: 'J', description: 'Electric potential energy of hydrogen atom ground state' },
  { symbol: 'R_∞', name: 'Rydberg Constant', category: 'Atomic & Nuclear', value: '10973731.568160', unit: 'm⁻¹', description: 'Wave number of highest-energy photon for hydrogen' },
  { symbol: 'λ_c', name: 'Compton Wavelength of Electron', category: 'Atomic & Nuclear', value: '2.42631023867e-12', unit: 'm', description: 'Quantum mechanical wavelength of electron at rest' },
  { symbol: 'μ_B', name: 'Bohr Magneton', category: 'Atomic & Nuclear', value: '9.2740100783e-24', unit: 'J/T', description: 'Natural unit for magnetic dipole moment of electron' },
  { symbol: 'μ_N', name: 'Nuclear Magneton', category: 'Atomic & Nuclear', value: '5.0507837461e-27', unit: 'J/T', description: 'Natural unit for magnetic dipole moment of nucleons' },
  { symbol: 'r_e', name: 'Classical Electron Radius', category: 'Atomic & Nuclear', value: '2.8179403262e-15', unit: 'm', description: 'Characteristic size scale of electron electrodynamics' },

  // --- ELECTROMAGNETIC ---
  { symbol: 'ε₀', name: 'Vacuum Permittivity (Electric Constant)', category: 'Electromagnetic', value: '8.8541878128e-12', unit: 'F/m', description: 'Capability of vacuum to permit electric field lines' },
  { symbol: 'μ₀', name: 'Vacuum Permeability (Magnetic Constant)', category: 'Electromagnetic', value: '1.25663706212e-6', unit: 'N/A²', description: 'Magnetic susceptibility of free space' },
  { symbol: 'Z₀', name: 'Characteristic Impedance of Vacuum', category: 'Electromagnetic', value: '376.730313668', unit: 'Ω', description: 'Ratio of electric to magnetic field magnitude in vacuum' },
  { symbol: 'k_e', name: "Coulomb's Constant", category: 'Electromagnetic', value: '8.9875517923e9', unit: 'N⋅m²/C²', description: 'Proportionality constant in electrostatic force equation' },
  { symbol: 'α', name: 'Fine-Structure Constant', category: 'Electromagnetic', value: '0.0072973525693', unit: 'dimensionless', description: 'Strength of electromagnetic interaction between elementary particles' },
  { symbol: 'K_J', name: 'Josephson Constant', category: 'Electromagnetic', value: '483597.8484e9', unit: 'Hz/V', description: 'Relates magnetic flux quantum to voltage in Josephson junction' },
  { symbol: 'R_K', name: 'Von Klitzing Constant', category: 'Electromagnetic', value: '25812.80745', unit: 'Ω', description: 'Quantum Hall effect standard resistance quantum' },
  { symbol: 'Φ₀', name: 'Magnetic Flux Quantum', category: 'Electromagnetic', value: '2.067833848e-15', unit: 'Wb', description: 'Smallest quantum packet of magnetic flux in superconductor' },

  // --- PHYSICO-CHEMICAL ---
  { symbol: 'N_A', name: 'Avogadro Constant', category: 'Physico-Chemical', value: '6.02214076e23', unit: 'mol⁻¹', description: 'Number of constituent particles in one mole of substance' },
  { symbol: 'k_B', name: 'Boltzmann Constant', category: 'Physico-Chemical', value: '1.380649e-23', unit: 'J/K', description: 'Relates average relative kinetic energy of gas particles to temperature' },
  { symbol: 'R', name: 'Molar Universal Gas Constant', category: 'Physico-Chemical', value: '8.314462618', unit: 'J/(mol⋅K)', description: 'Constant in ideal gas law PV = nRT' },
  { symbol: 'F', name: 'Faraday Constant', category: 'Physico-Chemical', value: '96485.33212', unit: 'C/mol', description: 'Magnitude of electric charge per mole of electrons' },
  { symbol: 'σ', name: 'Stefan-Boltzmann Constant', category: 'Physico-Chemical', value: '5.670374419e-8', unit: 'W/(m²⋅K⁴)', description: 'Blackbody radiation emissivity constant' },
  { symbol: 'b', name: "Wien's Displacement Constant", category: 'Physico-Chemical', value: '2.897771955e-3', unit: 'm⋅K', description: 'Constant relating peak wavelength to temperature' },
  { symbol: 'V_m', name: 'Molar Gas Volume (STP)', category: 'Physico-Chemical', value: '0.02271095464', unit: 'm³/mol', description: 'Volume occupied by one mole of ideal gas at standard temp/pressure' },
  { symbol: 'P_atm', name: 'Standard Atmospheric Pressure', category: 'Physico-Chemical', value: '101325', unit: 'Pa', description: 'Mean sea-level atmospheric pressure' },
  { symbol: 'c_water', name: 'Specific Heat Capacity of Liquid Water', category: 'Physico-Chemical', value: '4184', unit: 'J/(kg⋅K)', description: 'Heat needed to raise 1kg water by 1 Kelvin' },
  { symbol: 'L_f_ice', name: 'Latent Heat of Fusion of Water Ice', category: 'Physico-Chemical', value: '334000', unit: 'J/kg', description: 'Energy required to melt 1kg of ice at 0°C' },
  { symbol: 'L_v_water', name: 'Latent Heat of Vaporization of Water', category: 'Physico-Chemical', value: '2260000', unit: 'J/kg', description: 'Energy required to boil 1kg of liquid water at 100°C' },

  // --- ASTROPHYSICS & PLANETARY ---
  { symbol: 'AU', name: 'Astronomical Unit', category: 'Astrophysics', value: '149597870700', unit: 'm', description: 'Average mean distance from Earth to Sun' },
  { symbol: 'ly', name: 'Light-Year Distance', category: 'Astrophysics', value: '9.4607304725808e15', unit: 'm', description: 'Distance traversed by light in vacuum in one Julian year' },
  { symbol: 'pc', name: 'Parsec', category: 'Astrophysics', value: '3.08567758149137e16', unit: 'm', description: 'Distance at which one AU subtends an angle of one arcsecond' },
  { symbol: 'M_sun', name: 'Solar Mass (Sun)', category: 'Astrophysics', value: '1.98847e30', unit: 'kg', description: 'Standard unit of mass in astronomy equal to Sun mass' },
  { symbol: 'R_sun', name: 'Solar Radius', category: 'Astrophysics', value: '696340000', unit: 'm', description: 'Nominal photovoltaic radius of the Sun' },
  { symbol: 'L_sun', name: 'Solar Luminosity', category: 'Astrophysics', value: '3.828e26', unit: 'W', description: 'Total radiant power output emitted by the Sun' },
  { symbol: 'M_earth', name: 'Earth Mass', category: 'Astrophysics', value: '5.9722e24', unit: 'kg', description: 'Standard mass of planet Earth' },
  { symbol: 'R_earth', name: 'Mean Earth Radius', category: 'Astrophysics', value: '6371000', unit: 'm', description: 'Average volumetric radius of planet Earth' },
  { symbol: 'M_moon', name: 'Moon Mass', category: 'Astrophysics', value: '7.342e22', unit: 'kg', description: 'Total mass of Earth moon' },
  { symbol: 'H₀', name: 'Hubble Constant (Standard Cosmological)', category: 'Astrophysics', value: '2.184e-18', unit: 's⁻¹', description: 'Expansion rate of the observable universe' },

  // --- MATHEMATICAL CONSTANTS ---
  { symbol: 'π', name: 'Archimedes Pi', category: 'Mathematics', value: '3.141592653589793', unit: 'dimensionless', description: 'Ratio of circle circumference to its diameter' },
  { symbol: 'e', name: "Euler's Mathematical Base", category: 'Mathematics', value: '2.718281828459045', unit: 'dimensionless', description: 'Base of natural logarithms and exponential growth' },
  { symbol: 'φ', name: 'Golden Ratio (Phi)', category: 'Mathematics', value: '1.618033988749895', unit: 'dimensionless', description: 'Geometric ratio found in nature and Fibonacci sequences' },
  { symbol: 'γ_EM', name: 'Euler-Mascheroni Constant', category: 'Mathematics', value: '0.577215664901532', unit: 'dimensionless', description: 'Limiting difference between harmonic series and natural log' },
  { symbol: '√2', name: "Pythagoras' Constant", category: 'Mathematics', value: '1.414213562373095', unit: 'dimensionless', description: 'Diagonal of a unit square' },
  { symbol: '√3', name: "Theodorus' Constant", category: 'Mathematics', value: '1.732050807568877', unit: 'dimensionless', description: 'Diagonal of a unit cube' },
  { symbol: 'ln(2)', name: 'Natural Logarithm of 2', category: 'Mathematics', value: '0.693147180559945', unit: 'dimensionless', description: 'Appears in half-life calculations and binary entropy' },
  { symbol: 'ln(10)', name: 'Natural Logarithm of 10', category: 'Mathematics', value: '2.302585092994046', unit: 'dimensionless', description: 'Modulus of common logarithms' }
];
