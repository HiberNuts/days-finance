"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useToast } from "../ui/use-toast";
import { Button } from "../ui/button";
import AdminTable from "../superadmin/table";

export const FormDataSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  address: z.string().min(1, "Company address is required"),
  country: z.string().min(1, "Country is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Zip is required"),
});

type Inputs = z.infer<typeof FormDataSchema>;

const steps = [
  {
    id: "Step 1",
    name: "Company Details",
    fields: ["companyName", "address", "country", "city", "phone"],
  },
  {
    id: "Step 2",
    name: "Contact Details & Management Accounts",
    fields: ["managementAccounts"],
  },
  { id: "Step 3", name: "Employee Management" },
];

export default function Form() {
  const { toast } = useToast();
  const { data: session, status: sessionStatus } = useSession();
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const delta = currentStep - previousStep;
  const [orgData, setorgData] = useState(null);
  const [dataChanged, setdataChanged] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema),
  });

  const processForm: SubmitHandler<Inputs> = (data) => {
    console.log(data);
    reset();
  };

  type FieldName = keyof Inputs;

  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as FieldName[], { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        await handleSubmit(processForm)();
      }
      setPreviousStep(currentStep);
      setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  };

  useEffect(() => {
    const fetchOrganisationData = async () => {
      try {
        const response = await fetch(`/api/admin/organisation?id=${session?.user?.organizationId}`, {
          method: "GET",
        });

        if (response.ok) {
          const data = await response.json();
          const { organization } = data;
          console.log(organization);

          setorgData(organization);

          if (organization) {
            const { companyName, address, country, city, state, zipcode } = organization;
            reset({
              companyName,
              address,
              country,
              city,
              state,
              zip: zipcode,
            });
          }
        } else {
          console.error("Failed to fetch organisation data");
        }
      } catch (error) {
        console.error("Error fetching organisation data:", error);
      }
    };

    fetchOrganisationData();
  }, [reset, session, dataChanged]);

  const saveStepOne = async () => {
    try {
      const formData = {
        id: session?.user?.organizationId,
        companyName: watch("companyName"),
        address: watch("address"),
        country: watch("country"),
        city: watch("city"),
        state: watch("state"),
        zipcode: watch("zip"),
      };

      const response = await fetch("/api/admin/organisation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setdataChanged(!dataChanged);
        toast({ title: "Company information saved successfully" });
      } else {
        toast({ title: "Failed to save company information", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to save company information", variant: "destructive" });
    }
  };

  return (
    <section className="absolute mt-10 inset-0 flex flex-col justify-between p-24">
      {/* steps */}
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((step, index) => (
            <li key={step.name} className="md:flex-1">
              {currentStep > index ? (
                <div className="group flex w-full flex-col border-l-4 border-green-500 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-green-border-green-500 transition-colors ">{step.id}</span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : currentStep === index ? (
                <div
                  className="flex w-full flex-col border-l-4 border-green-500 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                  aria-current="step"
                >
                  <span className="text-sm font-medium text-green-border-green-500">{step.id}</span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : (
                <div className="group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-gray-500 transition-colors">{step.id}</span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Form */}
      <form className="mt-12 py-12" onSubmit={handleSubmit(processForm)}>
        {currentStep === 0 && (
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">Company Information</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">Provide the company details.</p>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="companyName" className="block text-sm font-medium leading-6 text-gray-900">
                  Company name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="companyName"
                    {...register("companyName")}
                    autoComplete="given-name"
                    className="block w-full px-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                  />
                  {errors.companyName?.message && (
                    <p className="mt-2 text-sm text-red-400">{errors.companyName.message}</p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">
                  Address
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="address"
                    {...register("address")}
                    autoComplete="family-name"
                    className="block px-1 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                  />
                  {errors.address?.message && <p className="mt-2 text-sm text-red-400">{errors.address.message}</p>}
                </div>
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
                  Country
                </label>
                <div className="mt-2">
                  <select
                    id="country"
                    {...register("country")}
                    autoComplete="country-name"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  >
                    <option>United States</option>
                    <option>India</option>
                    <option>Mexico</option>
                  </select>
                  {errors.country?.message && <p className="mt-2 text-sm text-red-400">{errors.country.message}</p>}
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">
                  City
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="city"
                    {...register("city")}
                    autoComplete="address-level2"
                    className="block px-1 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                  />
                  {errors.city?.message && <p className="mt-2 text-sm text-red-400">{errors.city.message}</p>}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="state" className="block text-sm font-medium leading-6 text-gray-900">
                  State / Province
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="state"
                    {...register("state")}
                    autoComplete="address-level1"
                    className="block px-1 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                  />
                  {errors.state?.message && <p className="mt-2 text-sm text-red-400">{errors.state.message}</p>}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="zip" className="block text-sm font-medium leading-6 text-gray-900">
                  ZIP / Postal code
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="zip"
                    {...register("zip")}
                    autoComplete="postal-code"
                    className="block px-1 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6"
                  />
                  {errors.zip?.message && <p className="mt-2 text-sm text-red-400">{errors.zip.message}</p>}
                </div>
              </div>
              <Button className="px-2 w-full" onClick={saveStepOne}>
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="flex flex-col h-full justify-evenly">
            <h2 className="text-base  font-bold leading-7 text-gray-900">{orgData?.companyName} admins</h2>
            <p className="mt-1 mb-10 text-sm leading-6 text-gray-600">Manage All the admins of your organisation</p>
            <AdminTable data={orgData.users} />
          </div>
        )}

        {currentStep === 2 && (
          <>
            <h2 className="text-base font-semibold leading-7 text-gray-900">Complete</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">Thank you for your submission.</p>
          </>
        )}
      </form>

      {/* Navigation */}
      <div className="mt-8 pt-5 mb-10">
        <div className="flex justify-between mb-10">
          <button
            type="button"
            onClick={prev}
            disabled={currentStep === 0}
            className="rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-green-500 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            disabled={currentStep === steps.length - 1}
            className="rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-green-500 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
