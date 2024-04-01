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
      test("Then the file should be sended if it's an image with extensions .png, .jpg or .jpeg", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        window.onNavigate(ROUTES_PATH.NewBill);

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });

        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );

        document.body.innerHTML = NewBillUI();

        const newBillInit = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        // //Test l.37 a 56

        // const fileName = "image_test.png";
        // const formData = new FormData();
        // const file = "image.png";
        // const email = JSON.parse(localStorage.getItem("user")).email;
        // formData.append("file", file);
        // formData.append("email", email);

        // const mockCreate = jest.fn().mockResolvedValue({
        //   fileUrl: 'https://test.com/image_test.png',
        //   key: '123',
        // });

        // const mockList = jest.fn();

        // mockStore.bills = jest.fn().mockReturnValue({
        //   create: mockCreate,
        //   list: mockList,
        // });

        // mockStore
        // .bills()
        // .create({
        //   data: formData,
        //   headers: {
        //     noContentType: true,
        //   },
        // })
        // .then(({ fileUrl, key }) => {
        //   newBillInit.billId = key;
        //   newBillInit.fileUrl = fileUrl;
        //   newBillInit.fileName = fileName;
        // })
        // .catch((error) => console.error(error));

        // expect(mockStore.bills).toHaveBeenCalled();
        // expect(mockCreate).toHaveBeenCalledWith({
        //   data: formData,
        //   headers: {
        //     noContentType: true,
        //   },
        // });
        // expect(newBillInit.billId).toBe('123');
        // expect(newBillInit.fileUrl).toBe('https://example.com/image.png');
        // expect(newBillInit.fileName).toBe(fileName);

        // //Fin du test l.37 a 56

        const handleChangeFile = jest.fn((e) =>
          newBillInit.handleChangeFile(e)
        );

        const pngFile = new File(["image"], "image.png", { type: "image/png" });
        const jpgFile = new File(["image"], "image.jpg", { type: "image/jpg" });
        const jpegFile = new File(["image"], "image.jpeg", {
          type: "image/jpeg",
        });

        const billFile = screen.getByTestId("file");

        billFile.addEventListener("change", handleChangeFile);
        fireEvent.change(billFile, {
          target: {
            files: [pngFile, jpgFile, jpegFile],
          },
        });

        expect(billFile.files[0].name).toBeDefined();
        expect(billFile.files[1].name).toBeDefined();
        expect(billFile.files[2].name).toBeDefined();
        expect(billFile.files[0]).toBe(pngFile);
        expect(billFile.files[1]).toBe(jpgFile);
        expect(billFile.files[2]).toBe(jpegFile);
        expect(billFile.files).toHaveLength(3);
        expect(handleChangeFile).toHaveBeenCalled();
        expect(handleChangeFile).toBeTruthy();
      });
    });

    describe("When employee submit a bill", () => {
      test("Then a new bill should be created if every field are fulfill", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        window.onNavigate(ROUTES_PATH.NewBill);

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });

        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a.com",
          })
        );

        document.body.innerHTML = NewBillUI();

        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        const bills = await mockStore.bills().list();
        const validBill = bills[2];

        expect(screen.getByTestId("expense-type")).value = validBill.type;
        expect(screen.getByTestId("expense-name")).value = validBill.name;
        expect(screen.getByTestId("datepicker")).value = validBill.date;
        expect(screen.getByTestId("amount")).value = validBill.amount;
        expect(screen.getByTestId("vat")).value = validBill.vat;
        expect(screen.getByTestId("pct")).value = validBill.pct;
        expect(screen.getByTestId("commentary")).value = validBill.commentary;

        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

        const form = screen.getByTestId("form-new-bill");
        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);

        expect(handleSubmit).toHaveBeenCalled();
      });
    });
  });
});
