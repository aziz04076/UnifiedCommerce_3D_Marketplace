import { NextRequest, NextResponse } from 'next/server';

interface PincodeData {
  city: string;
  state: string;
  estimatedDays: number;
  droneEligible: boolean;
  message: string;
}

const PINCODE_DIRECTORY: Record<string, PincodeData> = {
  // Mumbai Region
  '400001': { city: 'Mumbai', state: 'Maharashtra', estimatedDays: 1, droneEligible: true, message: 'Priority suborbital & autonomous drone corridor active.' },
  '400050': { city: 'Mumbai', state: 'Maharashtra', estimatedDays: 1, droneEligible: true, message: 'Same-day drone landing pad verified (Bandra West).' },
  '400076': { city: 'Mumbai', state: 'Maharashtra', estimatedDays: 1, droneEligible: true, message: 'Powai Technology Zone. 4-hour dispatch available.' },
  // Bengaluru
  '560001': { city: 'Bengaluru', state: 'Karnataka', estimatedDays: 1, droneEligible: true, message: 'Silicon Valley Corridor. 4-hour drone dispatch available.' },
  '560100': { city: 'Bengaluru', state: 'Karnataka', estimatedDays: 1, droneEligible: true, message: 'Electronic City Express Hub.' },
  '560034': { city: 'Bengaluru', state: 'Karnataka', estimatedDays: 1, droneEligible: true, message: 'Koramangala Tech District.' },
  // Delhi NCR
  '110001': { city: 'New Delhi', state: 'Delhi', estimatedDays: 1, droneEligible: true, message: 'Central Capital Hub. Next-day morning delivery.' },
  '110020': { city: 'New Delhi', state: 'Delhi', estimatedDays: 1, droneEligible: true, message: 'Okhla Logistics Node.' },
  '122001': { city: 'Gurugram', state: 'Haryana', estimatedDays: 1, droneEligible: true, message: 'Cyber City Hub. Next-day morning delivery.' },
  // Hyderabad
  '500001': { city: 'Hyderabad', state: 'Telangana', estimatedDays: 2, droneEligible: false, message: 'Express suborbital cargo node.' },
  '500081': { city: 'Hyderabad', state: 'Telangana', estimatedDays: 1, droneEligible: true, message: 'HITEC City Autonomous Corridor.' },
  // Pune
  '411001': { city: 'Pune', state: 'Maharashtra', estimatedDays: 1, droneEligible: true, message: 'Pune Central Tech Hub.' },
  // Chennai
  '600001': { city: 'Chennai', state: 'Tamil Nadu', estimatedDays: 2, droneEligible: false, message: 'Coastal Logistics Corridor.' },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pincode = (searchParams.get('pincode') || '').trim();

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json(
      {
        postalCode: pincode,
        isServiceable: false,
        city: '',
        state: '',
        estimatedDays: 0,
        shippingTiersAvailable: [],
        codAvailable: false,
        message: 'Please enter a valid 6-digit postal code.',
      },
      { status: 400 }
    );
  }

  const directMatch = PINCODE_DIRECTORY[pincode];
  if (directMatch) {
    const tiers = ['standard', 'express'];
    if (directMatch.droneEligible) tiers.push('drone');

    return NextResponse.json({
      postalCode: pincode,
      isServiceable: true,
      city: directMatch.city,
      state: directMatch.state,
      estimatedDays: directMatch.estimatedDays,
      shippingTiersAvailable: tiers,
      codAvailable: true,
      message: directMatch.message,
    });
  }

  // Generalized prefix matching for Indian postal regions
  const prefix = pincode.substring(0, 2);
  const statePrefixMap: Record<string, { state: string; city: string }> = {
    '11': { state: 'Delhi', city: 'New Delhi' },
    '12': { state: 'Haryana', city: 'Gurugram' },
    '40': { state: 'Maharashtra', city: 'Mumbai' },
    '41': { state: 'Maharashtra', city: 'Pune' },
    '56': { state: 'Karnataka', city: 'Bengaluru' },
    '50': { state: 'Telangana', city: 'Hyderabad' },
    '60': { state: 'Tamil Nadu', city: 'Chennai' },
    '70': { state: 'West Bengal', city: 'Kolkata' },
    '38': { state: 'Gujarat', city: 'Ahmedabad' },
  };

  const region = statePrefixMap[prefix] || { state: 'Maharashtra', city: 'Mumbai Suburban' };

  return NextResponse.json({
    postalCode: pincode,
    isServiceable: true,
    city: region.city,
    state: region.state,
    estimatedDays: 3,
    shippingTiersAvailable: ['standard', 'express'],
    codAvailable: true,
    message: `Serviceable via National Express Network. Estimated transit: 3 business days.`,
  });
}
