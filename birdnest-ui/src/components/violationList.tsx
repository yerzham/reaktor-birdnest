"use client";

import { ViolationDTO } from "@/dto/violation.dto";
import { useViolations } from "@/lib/useViolations";


export const ViolationList = ({violations: initialViolations, webSocketUrl}: {violations: ViolationDTO[], webSocketUrl: string}) => {
  const {violations, webSocketConnected} = useViolations(initialViolations, webSocketUrl);

  return (
    <div className="flex flex-col">
      {violations.map((violation, index) => (
          <div
            key={violation.serialNumber}
            className="p-4 mb-4 bg-white rounded-lg shadow"
          >
            <span className="text-gray-500 text-sm font-semibold">
              # {index + 1}
            </span>
            <p className="">
              <span className="text-gray-700">
                {violation.name} drone was{" "}
                <span className="text-red-700">
                  {(violation.distance / 1000).toFixed(2)} m
                </span>{" "}
                away from the nest
              </span>
              <br />
              <span className="text-gray-500 text-sm">{violation.email}</span>
              <br />
              <span className="text-gray-500 text-sm">
                {violation.phoneNumber}
              </span>
            </p>
          </div>
        ))}
    </div>
  );
};
