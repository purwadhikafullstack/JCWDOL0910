import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Loading from "react-loading";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const VerificationForm = ({ handleSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialValues = {
    otp: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object().shape({
    otp: Yup.string().required("Verification Code is required"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters")
      .matches(
        /^(?=.*[A-Z])(?=.*\d)/,
        "Password must have at least 1 uppercase letter and 1 digit"
      ),
    confirmPassword: Yup.string()
      .required("Confirm Password is required")
      .oneOf([Yup.ref("password"), null], "Passwords must match"),
  });
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Verification Code</span>
            </label>
            <Field
              type="text"
              name="otp"
              placeholder=""
              className="input input-bordered"
              disabled={isLoading || isSubmitting}
            />
            <ErrorMessage
              name="otp"
              component="div"
              className="text-red-500 text-[9px] lg:text-[13px] pt-1"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <div className="relative">
              <Field
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder=""
                className="input input-bordered pr-[40px] lg:pr-[138px] "
                disabled={isLoading || isSubmitting}
              />
              {showPassword ? (
                <AiFillEyeInvisible
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                />
              ) : (
                <AiFillEye
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                />
              )}
            </div>
            <ErrorMessage
              name="password"
              component="div"
              className="text-red-500 text-[9px] lg:text-[13px] pt-1"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <div className="relative">
              <Field
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder=""
                className="input input-bordered pr-[40px] lg:pr-[138px] "
                disabled={isLoading || isSubmitting}
              />
              {showConfirmPassword ? (
                <AiFillEyeInvisible
                  className="absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-500 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              ) : (
                <AiFillEye
                  className="absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-500 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              )}
            </div>
            <ErrorMessage
              name="confirmPassword"
              component="div"
              className="text-red-500 text-[9px] lg:text-[13px] pt-1"
            />
          </div>

          <div className="form-control mt-6">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || isSubmitting}
            >
              {isLoading ? (
                <Loading type="spin" color="#fff" height={20} width={20} />
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default VerificationForm;
