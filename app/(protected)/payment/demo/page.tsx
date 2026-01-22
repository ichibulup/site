'use client'

import React, { useState, useEffect } from 'react';
import { PaymentStatus } from '@/lib/interfaces';

export default function PaymentPage() {
	const [layout, setLayout] = useState<PaymentStatus>(PaymentStatus.pending);

  return (
    <>
      {layout === PaymentStatus.pending ? (
        <>
					Payment Page
				</>
      ) : layout === PaymentStatus.completed ? (
        <>
					Payment Complete
				</>
      ) : layout === PaymentStatus.processing ? (
        <>
					Payment Processing
				</>
      ) : layout === PaymentStatus.cancelled ? (
        <>
					Payment Cancelled
				</>
      ) : (
				<>
					Payment Failed
				</>
			)}
    </>
  );
}
