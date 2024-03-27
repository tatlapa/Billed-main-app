/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon.classList.contains("active-icon")).toBeTruthy();
    });

    describe("When employee upload a file", () => {
      describe("When the file is an image with png, jpeg or jpg extension", () => {
        test("Then the file should be uploaded", () => {
          jest.spyOn(mockStore, "bills");

          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
          };

          Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
          });
          Object.defineProperty(window, "location", {
            value: { hash: ROUTES_PATH["NewBill"] },
          });
          window.localStorage.setItem(
            "user",
            JSON.stringify({
              type: "Employee",
            })
          );

          const html = NewBillUI();
          document.body.innerHTML = html;

          const newBillInit = new NewBill({
            document,
            onNavigate,
            store: mockStore,
            localStorage: window.localStorage,
          });

          const handleChangeFile = jest.fn((e) =>
            newBillInit.handleChangeFile(e)
          );

          const file = new File(["image"], "image.png", { type: "image/png" });
          const billFile = screen.getByTestId("file");

          billFile.addEventListener("change", handleChangeFile);
          fireEvent.change(billFile, {
            target: {
              files: [file],
            },
          });

          expect(billFile.files[0].name).toBeDefined();
          expect(billFile.files[0]).toBe(file);
          expect(billFile.files).toHaveLength(1);
          expect(handleChangeFile).toHaveBeenCalled();
          expect(handleChangeFile).toBeTruthy();
        });
      });
    });

    describe("When employee submit a bill", () => {
      test("Then a new bill should be created", () => {
        jest.spyOn(mockStore, "bills");

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        Object.defineProperty(window, "location", {
          value: { hash: ROUTES_PATH["NewBill"] },
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        const html = NewBillUI();
        document.body.innerHTML = html;

        const newBillInit = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
        const formNewBill = screen.getByTestId("form-new-bill");
        formNewBill.addEventListener("submit", handleSubmit);
        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });
});
