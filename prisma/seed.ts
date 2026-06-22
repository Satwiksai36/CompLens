import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import process from 'node:process';
import path from 'path';

const dbPath = `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Cleaning database...');
  await prisma.compensationRecord.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.level.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.company.deleteMany({});
  console.log('Database clean.');

  // 1. Seed Locations
  const locations = [
    { city: 'San Francisco', country: 'United States', region: 'AMER', costOfLivingIndex: 100.0 },
    { city: 'Seattle', country: 'United States', region: 'AMER', costOfLivingIndex: 90.0 },
    { city: 'New York City', country: 'United States', region: 'AMER', costOfLivingIndex: 95.0 },
    { city: 'London', country: 'United Kingdom', region: 'EMEA', costOfLivingIndex: 80.0 },
    { city: 'Bangalore', country: 'India', region: 'APAC', costOfLivingIndex: 30.0 },
    { city: 'Hyderabad', country: 'India', region: 'APAC', costOfLivingIndex: 28.0 },
    { city: 'Pune', country: 'India', region: 'APAC', costOfLivingIndex: 25.0 },
    { city: 'Chennai', country: 'India', region: 'APAC', costOfLivingIndex: 24.0 },
    { city: 'Delhi', country: 'India', region: 'APAC', costOfLivingIndex: 27.0 },
    { city: 'Mumbai', country: 'India', region: 'APAC', costOfLivingIndex: 32.0 },
  ];

  const dbLocations: Record<string, any> = {};
  for (const loc of locations) {
    const dbLoc = await prisma.location.create({ data: loc });
    dbLocations[loc.city] = dbLoc;
  }
  console.log(`Seeded ${locations.length} locations.`);

  // 2. Seed Roles
  const roles = [
    { roleName: 'Software Engineer', category: 'Software Engineering' },
    { roleName: 'Product Manager', category: 'Product Management' },
    { roleName: 'Data Scientist', category: 'Data Science' },
    { roleName: 'ML Engineer', category: 'ML Engineering' },
    { roleName: 'DevOps Engineer', category: 'DevOps' },
    { roleName: 'Security Engineer', category: 'Security' },
    { roleName: 'Designer', category: 'Design' },
  ];

  const dbRoles: Record<string, any> = {};
  for (const role of roles) {
    const dbRole = await prisma.role.create({ data: role });
    dbRoles[role.roleName] = dbRole;
  }
  console.log(`Seeded ${roles.length} roles.`);

  // 3. Seed Companies
  const companies = [
    { name: 'Google', industry: 'Technology', logo: 'logo-google' },
    { name: 'Meta', industry: 'Technology', logo: 'logo-meta' },
    { name: 'Amazon', industry: 'E-commerce & Cloud', logo: 'logo-amazon' },
    { name: 'Microsoft', industry: 'Technology', logo: 'logo-microsoft' },
    { name: 'Apple', industry: 'Consumer Electronics', logo: 'logo-apple' },
    { name: 'Netflix', industry: 'Entertainment & Tech', logo: 'logo-netflix' },
    { name: 'Uber', industry: 'Ride Hailing & Logistics', logo: 'logo-uber' },
    { name: 'Airbnb', industry: 'Travel & Hospitality', logo: 'logo-airbnb' },
    { name: 'Adobe', industry: 'Creative Software', logo: 'logo-adobe' },
    { name: 'Salesforce', industry: 'Enterprise SaaS', logo: 'logo-salesforce' },
  ];

  const dbCompanies: Record<string, any> = {};
  for (const comp of companies) {
    const dbC = await prisma.company.create({ data: comp });
    dbCompanies[comp.name] = dbC;
  }
  console.log(`Seeded ${companies.length} companies.`);

  // 4. Seed Levels (Disclosed)
  const levelingMatrix: Record<string, Array<{ code: string; equiv: string; desc: string }>> = {
    Google: [
      { code: 'L3', equiv: 'Entry', desc: 'Entry-level Software Engineer. Typically new grads.' },
      { code: 'L4', equiv: 'Mid', desc: 'Mid-level Engineer. 2-5 years of experience.' },
      { code: 'L5', equiv: 'Senior', desc: 'Senior Software Engineer. Technical leaders.' },
      { code: 'L6', equiv: 'Staff', desc: 'Staff Software Engineer. Multi-team impact.' },
      { code: 'L7', equiv: 'Principal', desc: 'Principal Engineer. Org-wide impact.' },
      { code: 'L8', equiv: 'Director+', desc: 'Director / Distinguished Engineer.' },
    ],
    Meta: [
      { code: 'E3', equiv: 'Entry', desc: 'Rotational / Entry Engineer.' },
      { code: 'E4', equiv: 'Mid', desc: 'Intermediate Engineer.' },
      { code: 'E5', equiv: 'Senior', desc: 'Senior Engineer. Core IC role.' },
      { code: 'E6', equiv: 'Staff', desc: 'Staff Engineer. Directs initiatives.' },
      { code: 'E7', equiv: 'Principal', desc: 'Principal Engineer / Director.' },
      { code: 'E8', equiv: 'Director+', desc: 'VP / Fellow / Director.' },
    ],
    Amazon: [
      { code: 'L4', equiv: 'Entry', desc: 'Software Development Engineer I.' },
      { code: 'L5', equiv: 'Mid', desc: 'Software Development Engineer II.' },
      { code: 'L6', equiv: 'Senior', desc: 'Software Development Engineer III (Senior).' },
      { code: 'L7', equiv: 'Staff', desc: 'Principal Engineer.' },
      { code: 'L8', equiv: 'Principal', desc: 'Senior Principal Engineer.' },
      { code: 'L9', equiv: 'Director+', desc: 'Director / VP.' },
    ],
    Microsoft: [
      { code: '59', equiv: 'Entry', desc: 'Software Engineer.' },
      { code: '61', equiv: 'Mid', desc: 'Software Engineer II.' },
      { code: '63', equiv: 'Senior', desc: 'Senior Software Engineer.' },
      { code: '65', equiv: 'Staff', desc: 'Principal Software Engineer.' },
      { code: '67', equiv: 'Principal', desc: 'Partner Software Engineer.' },
      { code: '69', equiv: 'Director+', desc: 'Technical Fellow / Director.' },
    ],
    Apple: [
      { code: 'ICT2', equiv: 'Entry', desc: 'Individual Contributor 2.' },
      { code: 'ICT3', equiv: 'Mid', desc: 'Individual Contributor 3.' },
      { code: 'ICT4', equiv: 'Senior', desc: 'Individual Contributor 4 (Senior).' },
      { code: 'ICT5', equiv: 'Staff', desc: 'Individual Contributor 5 (Staff).' },
      { code: 'ICT6', equiv: 'Principal', desc: 'Individual Contributor 6 (Principal).' },
      { code: 'ICT7', equiv: 'Director+', desc: 'Director / VP.' },
    ],
    Netflix: [
      { code: 'L3', equiv: 'Entry', desc: 'New Grad / Associate Engineer.' },
      { code: 'L4', equiv: 'Mid', desc: 'Intermediate Engineer.' },
      { code: 'L5', equiv: 'Senior', desc: 'Senior Software Engineer.' },
      { code: 'L6', equiv: 'Staff', desc: 'Staff Software Engineer.' },
      { code: 'L7', equiv: 'Principal', desc: 'Principal Engineer.' },
      { code: 'L8', equiv: 'Director+', desc: 'Director / VP.' },
    ],
    Uber: [
      { code: 'L3', equiv: 'Entry', desc: 'Software Engineer I.' },
      { code: 'L4', equiv: 'Mid', desc: 'Software Engineer II.' },
      { code: 'L5', equiv: 'Senior', desc: 'Senior Software Engineer.' },
      { code: 'L6', equiv: 'Staff', desc: 'Staff Software Engineer.' },
      { code: 'L7', equiv: 'Principal', desc: 'Principal Software Engineer.' },
      { code: 'L8', equiv: 'Director+', desc: 'Director.' },
    ],
    Airbnb: [
      { code: 'G7', equiv: 'Entry', desc: 'Engineer I.' },
      { code: 'G8', equiv: 'Mid', desc: 'Engineer II.' },
      { code: 'G9', equiv: 'Senior', desc: 'Senior Engineer.' },
      { code: 'G10', equiv: 'Staff', desc: 'Staff Engineer.' },
      { code: 'G11', equiv: 'Principal', desc: 'Principal Engineer.' },
      { code: 'G12', equiv: 'Director+', desc: 'Director.' },
    ],
    Adobe: [
      { code: 'Grade 3', equiv: 'Entry', desc: 'Software Engineer I.' },
      { code: 'Grade 4', equiv: 'Mid', desc: 'Software Engineer II.' },
      { code: 'Grade 5', equiv: 'Senior', desc: 'Senior Software Engineer.' },
      { code: 'Grade 6', equiv: 'Staff', desc: 'Computer Scientist.' },
      { code: 'Grade 7', equiv: 'Principal', desc: 'Senior Computer Scientist.' },
      { code: 'Grade 8', equiv: 'Director+', desc: 'Principal Computer Scientist.' },
    ],
    Salesforce: [
      { code: 'AMTS', equiv: 'Entry', desc: 'Associate Member of Technical Staff.' },
      { code: 'MTS', equiv: 'Mid', desc: 'Member of Technical Staff.' },
      { code: 'Senior MTS', equiv: 'Senior', desc: 'Senior Member of Technical Staff.' },
      { code: 'Lead MTS', equiv: 'Staff', desc: 'Lead Member of Technical Staff.' },
      { code: 'Principal MTS', equiv: 'Principal', desc: 'Principal Member of Technical Staff.' },
      { code: 'Architect', equiv: 'Director+', desc: 'Architect / Director.' },
    ],
  };

  const dbLevels: Record<string, Record<string, any>> = {};
  for (const [compName, levelsList] of Object.entries(levelingMatrix)) {
    dbLevels[compName] = {};
    for (const lvl of levelsList) {
      const dbLvl = await prisma.level.create({
        data: {
          companyId: dbCompanies[compName].id,
          levelCode: lvl.code,
          equivalentLevel: lvl.equiv,
          description: lvl.desc,
          mappingType: 'disclosed',
          confidenceScore: 1.0,
        },
      });
      dbLevels[compName][lvl.code] = dbLvl;
    }
  }
  console.log('Seeded leveling frameworks for all 10 companies.');

  // 5. Seed Users
  const adminUser = await prisma.user.create({
    data: { email: 'admin@complens.com', role: 'ADMIN' },
  });
  const normalUser = await prisma.user.create({
    data: { email: 'user@complens.com', role: 'USER' },
  });
  console.log('Seeded Users.');

  // Helper function to create compensation records
  const addCompRecord = async (params: {
    company: string;
    role: string;
    levelCode: string;
    city: string;
    yoe: number;
    base: number;
    stock: number;
    bonus: number;
    joining: number;
    currency: string;
    status?: string;
  }) => {
    const company = dbCompanies[params.company];
    const role = dbRoles[params.role];
    const level = dbLevels[params.company][params.levelCode];
    const location = dbLocations[params.city];

    if (!company || !role || !level || !location) {
      console.warn(`Skipping seeding record due to missing relations for: ${params.company}, ${params.role}, ${params.levelCode}, ${params.city}`);
      return;
    }

    const total = params.base + (params.stock / 4) + params.bonus;

    await prisma.compensationRecord.create({
      data: {
        companyId: company.id,
        roleId: role.id,
        levelId: level.id,
        locationId: location.id,
        yearsExperience: params.yoe,
        baseSalary: params.base,
        stockGrant: params.stock,
        bonus: params.bonus,
        joiningBonus: params.joining,
        totalCompensation: total,
        currency: params.currency,
        verificationStatus: params.status || 'VERIFIED',
        userId: normalUser.id,
      },
    });
  };

  // Google SWE Data Points
  await addCompRecord({ company: 'Google', role: 'Software Engineer', levelCode: 'L3', city: 'San Francisco', yoe: 1, base: 142000, stock: 100000, bonus: 15000, joining: 20000, currency: 'USD' });
  await addCompRecord({ company: 'Google', role: 'Software Engineer', levelCode: 'L3', city: 'Seattle', yoe: 2, base: 138000, stock: 92000, bonus: 14000, joining: 15000, currency: 'USD' });
  await addCompRecord({ company: 'Google', role: 'Software Engineer', levelCode: 'L4', city: 'San Francisco', yoe: 3, base: 168000, stock: 180000, bonus: 25000, joining: 20000, currency: 'USD' });
  await addCompRecord({ company: 'Google', role: 'Software Engineer', levelCode: 'L4', city: 'New York City', yoe: 4, base: 172000, stock: 195000, bonus: 26000, joining: 25000, currency: 'USD' });
  await addCompRecord({ company: 'Google', role: 'Software Engineer', levelCode: 'L5', city: 'San Francisco', yoe: 7, base: 205000, stock: 320000, bonus: 40000, joining: 35000, currency: 'USD' });
  await addCompRecord({ company: 'Google', role: 'Software Engineer', levelCode: 'L5', city: 'Bangalore', yoe: 6, base: 3800000, stock: 4000000, bonus: 450000, joining: 500000, currency: 'INR' });
  await addCompRecord({ company: 'Google', role: 'Software Engineer', levelCode: 'L6', city: 'San Francisco', yoe: 10, base: 245000, stock: 520000, bonus: 60000, joining: 50000, currency: 'USD' });
  await addCompRecord({ company: 'Google', role: 'Software Engineer', levelCode: 'L6', city: 'Bangalore', yoe: 11, base: 5600000, stock: 6800000, bonus: 700000, joining: 800000, currency: 'INR' });
  await addCompRecord({ company: 'Google', role: 'Software Engineer', levelCode: 'L7', city: 'San Francisco', yoe: 14, base: 290000, stock: 880000, bonus: 90000, joining: 100000, currency: 'USD' });

  // Meta SWE Data Points
  await addCompRecord({ company: 'Meta', role: 'Software Engineer', levelCode: 'E3', city: 'San Francisco', yoe: 1, base: 145000, stock: 120000, bonus: 15000, joining: 25000, currency: 'USD' });
  await addCompRecord({ company: 'Meta', role: 'Software Engineer', levelCode: 'E4', city: 'San Francisco', yoe: 3, base: 178000, stock: 220000, bonus: 26000, joining: 20000, currency: 'USD' });
  await addCompRecord({ company: 'Meta', role: 'Software Engineer', levelCode: 'E4', city: 'Seattle', yoe: 4, base: 170000, stock: 200000, bonus: 25000, joining: 20000, currency: 'USD' });
  await addCompRecord({ company: 'Meta', role: 'Software Engineer', levelCode: 'E5', city: 'San Francisco', yoe: 6, base: 215000, stock: 400000, bonus: 43000, joining: 30000, currency: 'USD' });
  await addCompRecord({ company: 'Meta', role: 'Software Engineer', levelCode: 'E5', city: 'London', yoe: 7, base: 125000, stock: 220000, bonus: 22000, joining: 18000, currency: 'GBP' });
  await addCompRecord({ company: 'Meta', role: 'Software Engineer', levelCode: 'E5', city: 'Bangalore', yoe: 7, base: 4200000, stock: 4800000, bonus: 500000, joining: 600000, currency: 'INR' });
  await addCompRecord({ company: 'Meta', role: 'Software Engineer', levelCode: 'E6', city: 'San Francisco', yoe: 11, base: 260000, stock: 680000, bonus: 78000, joining: 50000, currency: 'USD' });
  await addCompRecord({ company: 'Meta', role: 'Software Engineer', levelCode: 'E7', city: 'San Francisco', yoe: 15, base: 310000, stock: 1100000, bonus: 110000, joining: 100000, currency: 'USD' });

  // Amazon SWE Data Points
  await addCompRecord({ company: 'Amazon', role: 'Software Engineer', levelCode: 'L4', city: 'Seattle', yoe: 1, base: 130000, stock: 80000, bonus: 20000, joining: 25000, currency: 'USD' });
  await addCompRecord({ company: 'Amazon', role: 'Software Engineer', levelCode: 'L4', city: 'Bangalore', yoe: 1, base: 1600000, stock: 900000, bonus: 250000, joining: 300000, currency: 'INR' });
  await addCompRecord({ company: 'Amazon', role: 'Software Engineer', levelCode: 'L5', city: 'Seattle', yoe: 3, base: 162000, stock: 160000, bonus: 32000, joining: 20000, currency: 'USD' });
  await addCompRecord({ company: 'Amazon', role: 'Software Engineer', levelCode: 'L5', city: 'Bangalore', yoe: 4, base: 2500000, stock: 1600000, bonus: 350000, joining: 400000, currency: 'INR' });
  await addCompRecord({ company: 'Amazon', role: 'Software Engineer', levelCode: 'L6', city: 'Seattle', yoe: 7, base: 198000, stock: 320000, bonus: 40000, joining: 30000, currency: 'USD' });
  await addCompRecord({ company: 'Amazon', role: 'Software Engineer', levelCode: 'L6', city: 'Bangalore', yoe: 8, base: 4100000, stock: 3500000, bonus: 500000, joining: 600000, currency: 'INR' });
  await addCompRecord({ company: 'Amazon', role: 'Software Engineer', levelCode: 'L7', city: 'Seattle', yoe: 11, base: 240000, stock: 600000, bonus: 60000, joining: 50000, currency: 'USD' });

  // Microsoft SWE Data Points
  await addCompRecord({ company: 'Microsoft', role: 'Software Engineer', levelCode: '59', city: 'Seattle', yoe: 1, base: 122000, stock: 60000, bonus: 12000, joining: 15000, currency: 'USD' });
  await addCompRecord({ company: 'Microsoft', role: 'Software Engineer', levelCode: '61', city: 'Seattle', yoe: 3, base: 148000, stock: 100000, bonus: 18000, joining: 15000, currency: 'USD' });
  await addCompRecord({ company: 'Microsoft', role: 'Software Engineer', levelCode: '63', city: 'Seattle', yoe: 6, base: 188000, stock: 180000, bonus: 28000, joining: 20000, currency: 'USD' });
  await addCompRecord({ company: 'Microsoft', role: 'Software Engineer', levelCode: '63', city: 'Bangalore', yoe: 6, base: 2800000, stock: 1800000, bonus: 350000, joining: 400000, currency: 'INR' });
  await addCompRecord({ company: 'Microsoft', role: 'Software Engineer', levelCode: '65', city: 'Seattle', yoe: 10, base: 220000, stock: 300000, bonus: 44000, joining: 30000, currency: 'USD' });
  await addCompRecord({ company: 'Microsoft', role: 'Software Engineer', levelCode: '67', city: 'Seattle', yoe: 13, base: 260000, stock: 500000, bonus: 60000, joining: 50000, currency: 'USD' });

  // Apple SWE Data Points
  await addCompRecord({ company: 'Apple', role: 'Software Engineer', levelCode: 'ICT2', city: 'San Francisco', yoe: 1, base: 135000, stock: 90000, bonus: 15000, joining: 15000, currency: 'USD' });
  await addCompRecord({ company: 'Apple', role: 'Software Engineer', levelCode: 'ICT3', city: 'San Francisco', yoe: 3, base: 165000, stock: 150000, bonus: 25000, joining: 20000, currency: 'USD' });
  await addCompRecord({ company: 'Apple', role: 'Software Engineer', levelCode: 'ICT4', city: 'San Francisco', yoe: 6, base: 200000, stock: 280000, bonus: 35000, joining: 25000, currency: 'USD' });
  await addCompRecord({ company: 'Apple', role: 'Software Engineer', levelCode: 'ICT5', city: 'San Francisco', yoe: 9, base: 235000, stock: 450000, bonus: 48000, joining: 30000, currency: 'USD' });

  // Netflix SWE Data Points
  await addCompRecord({ company: 'Netflix', role: 'Software Engineer', levelCode: 'L5', city: 'San Francisco', yoe: 6, base: 360000, stock: 160000, bonus: 0, joining: 30000, currency: 'USD' });
  await addCompRecord({ company: 'Netflix', role: 'Software Engineer', levelCode: 'L6', city: 'San Francisco', yoe: 10, base: 450000, stock: 200000, bonus: 0, joining: 40000, currency: 'USD' });

  // Uber SWE Data Points
  await addCompRecord({ company: 'Uber', role: 'Software Engineer', levelCode: 'L3', city: 'San Francisco', yoe: 1, base: 130000, stock: 100000, bonus: 15000, joining: 15000, currency: 'USD' });
  await addCompRecord({ company: 'Uber', role: 'Software Engineer', levelCode: 'L4', city: 'San Francisco', yoe: 3, base: 160000, stock: 170000, bonus: 24000, joining: 20000, currency: 'USD' });
  await addCompRecord({ company: 'Uber', role: 'Software Engineer', levelCode: 'L5', city: 'San Francisco', yoe: 6, base: 200000, stock: 280000, bonus: 36000, joining: 25000, currency: 'USD' });
  await addCompRecord({ company: 'Uber', role: 'Software Engineer', levelCode: 'L5', city: 'Bangalore', yoe: 7, base: 3500000, stock: 3000000, bonus: 400000, joining: 500000, currency: 'INR' });

  // Airbnb SWE Data Points
  await addCompRecord({ company: 'Airbnb', role: 'Software Engineer', levelCode: 'G7', city: 'San Francisco', yoe: 1, base: 138000, stock: 110000, bonus: 15000, joining: 20000, currency: 'USD' });
  await addCompRecord({ company: 'Airbnb', role: 'Software Engineer', levelCode: 'G8', city: 'San Francisco', yoe: 3, base: 165000, stock: 190000, bonus: 25000, joining: 20000, currency: 'USD' });
  await addCompRecord({ company: 'Airbnb', role: 'Software Engineer', levelCode: 'G9', city: 'San Francisco', yoe: 6, base: 205000, stock: 320000, bonus: 38000, joining: 30000, currency: 'USD' });

  // Adobe SWE Data Points
  await addCompRecord({ company: 'Adobe', role: 'Software Engineer', levelCode: 'Grade 3', city: 'San Francisco', yoe: 1, base: 120000, stock: 60000, bonus: 12000, joining: 10000, currency: 'USD' });
  await addCompRecord({ company: 'Adobe', role: 'Software Engineer', levelCode: 'Grade 4', city: 'San Francisco', yoe: 3, base: 145000, stock: 100000, bonus: 20000, joining: 15000, currency: 'USD' });
  await addCompRecord({ company: 'Adobe', role: 'Software Engineer', levelCode: 'Grade 5', city: 'San Francisco', yoe: 6, base: 185000, stock: 180000, bonus: 32000, joining: 20000, currency: 'USD' });
  await addCompRecord({ company: 'Adobe', role: 'Software Engineer', levelCode: 'Grade 5', city: 'Delhi', yoe: 6, base: 2600000, stock: 1600000, bonus: 300000, joining: 300000, currency: 'INR' }); // mapped to Delhi region for simplicity

  // Salesforce SWE Data Points
  await addCompRecord({ company: 'Salesforce', role: 'Software Engineer', levelCode: 'AMTS', city: 'San Francisco', yoe: 1, base: 125000, stock: 70000, bonus: 12000, joining: 15000, currency: 'USD' });
  await addCompRecord({ company: 'Salesforce', role: 'Software Engineer', levelCode: 'MTS', city: 'San Francisco', yoe: 3, base: 150000, stock: 120000, bonus: 22000, joining: 20000, currency: 'USD' });
  await addCompRecord({ company: 'Salesforce', role: 'Software Engineer', levelCode: 'Senior MTS', city: 'San Francisco', yoe: 6, base: 190000, stock: 200000, bonus: 34000, joining: 25000, currency: 'USD' });

  // Additional PM, DS and other roles data points to populate dashboards
  await addCompRecord({ company: 'Google', role: 'Product Manager', levelCode: 'L4', city: 'San Francisco', yoe: 3, base: 165000, stock: 160000, bonus: 24000, joining: 20000, currency: 'USD' });
  await addCompRecord({ company: 'Google', role: 'Product Manager', levelCode: 'L5', city: 'San Francisco', yoe: 6, base: 200000, stock: 280000, bonus: 38000, joining: 30000, currency: 'USD' });
  await addCompRecord({ company: 'Meta', role: 'Product Manager', levelCode: 'E5', city: 'New York City', yoe: 7, base: 210000, stock: 320000, bonus: 40000, joining: 35000, currency: 'USD' });

  await addCompRecord({ company: 'Google', role: 'Data Scientist', levelCode: 'L4', city: 'San Francisco', yoe: 3, base: 160000, stock: 150000, bonus: 22000, joining: 15000, currency: 'USD' });
  await addCompRecord({ company: 'Google', role: 'Data Scientist', levelCode: 'L5', city: 'San Francisco', yoe: 6, base: 195000, stock: 260000, bonus: 35000, joining: 25000, currency: 'USD' });
  await addCompRecord({ company: 'Meta', role: 'Data Scientist', levelCode: 'E5', city: 'San Francisco', yoe: 6, base: 205000, stock: 300000, bonus: 38000, joining: 25000, currency: 'USD' });

  // India Cities (Bangalore, Hyderabad, Pune, Chennai, Delhi, Mumbai) SWE data points
  // Google
  await addCompRecord({ company: 'Google', role: 'Software Engineer', levelCode: 'L4', city: 'Bangalore', yoe: 3, base: 2400000, stock: 1800000, bonus: 280000, joining: 300000, currency: 'INR' });
  await addCompRecord({ company: 'Google', role: 'Software Engineer', levelCode: 'L4', city: 'Hyderabad', yoe: 4, base: 2300000, stock: 1700000, bonus: 260000, joining: 300000, currency: 'INR' });
  
  // Meta
  await addCompRecord({ company: 'Meta', role: 'Software Engineer', levelCode: 'E4', city: 'Bangalore', yoe: 4, base: 2700000, stock: 2200000, bonus: 320000, joining: 400000, currency: 'INR' });
  await addCompRecord({ company: 'Meta', role: 'Software Engineer', levelCode: 'E4', city: 'Hyderabad', yoe: 4, base: 2600000, stock: 2000000, bonus: 300000, joining: 400000, currency: 'INR' });

  // Microsoft
  await addCompRecord({ company: 'Microsoft', role: 'Software Engineer', levelCode: '61', city: 'Hyderabad', yoe: 3, base: 2000000, stock: 1000000, bonus: 200000, joining: 250000, currency: 'INR' });
  await addCompRecord({ company: 'Microsoft', role: 'Software Engineer', levelCode: '63', city: 'Hyderabad', yoe: 6, base: 2700000, stock: 1600000, bonus: 300000, joining: 350000, currency: 'INR' });

  // Amazon
  await addCompRecord({ company: 'Amazon', role: 'Software Engineer', levelCode: 'L5', city: 'Hyderabad', yoe: 4, base: 2400000, stock: 1500000, bonus: 300000, joining: 350000, currency: 'INR' });
  await addCompRecord({ company: 'Amazon', role: 'Software Engineer', levelCode: 'L5', city: 'Pune', yoe: 4, base: 2200000, stock: 1400000, bonus: 280000, joining: 300000, currency: 'INR' });
  await addCompRecord({ company: 'Amazon', role: 'Software Engineer', levelCode: 'L5', city: 'Chennai', yoe: 5, base: 2100000, stock: 1300000, bonus: 260000, joining: 300000, currency: 'INR' });
  await addCompRecord({ company: 'Amazon', role: 'Software Engineer', levelCode: 'L5', city: 'Delhi', yoe: 4, base: 2300000, stock: 1500000, bonus: 290000, joining: 300000, currency: 'INR' });
  await addCompRecord({ company: 'Amazon', role: 'Software Engineer', levelCode: 'L5', city: 'Mumbai', yoe: 4, base: 2500000, stock: 1600000, bonus: 320000, joining: 400000, currency: 'INR' });

  // Unverified data points for admin moderator testing
  await addCompRecord({ company: 'Google', role: 'Software Engineer', levelCode: 'L5', city: 'San Francisco', yoe: 6, base: 210000, stock: 340000, bonus: 42000, joining: 30000, currency: 'USD', status: 'PENDING' });
  await addCompRecord({ company: 'Meta', role: 'Software Engineer', levelCode: 'E5', city: 'Seattle', yoe: 5, base: 200000, stock: 380000, bonus: 38000, joining: 25000, currency: 'USD', status: 'PENDING' });

  console.log('Seeded compensation records.');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
