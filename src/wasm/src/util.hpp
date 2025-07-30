#pragma once

#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <array>
#include <type_traits>

namespace emscripten
{
    template <typename To, typename From, typename ClassType>
    constexpr To ClassType::*cast_member(From ClassType::*member)
    {
        return reinterpret_cast<To ClassType::*>(member);
    }

    template <typename ClassType, typename T>
    struct raw_constructor_wrapper;

    template <typename ClassType, typename... Args>
    struct raw_constructor_wrapper<ClassType, std::tuple<Args...>>
    {
        static ClassType *raw_ctor(Args... args)
        {
            return internal::raw_constructor<ClassType, Args...>(args...);
        }
    };

    template <typename ClassType>
    ClassType *dummy_ctor() { return nullptr; }

    static inline void dummy_setter() {}

    // value_object that can't be constructed nor modified from JS
    template <typename ClassType>
    class value_immutable_unconstructable : public internal::noncopyable
    {
    public:
        value_immutable_unconstructable(const char *name)
        {
            using namespace internal;

            auto ctor = &dummy_ctor<ClassType>;
            auto dtor = &raw_destructor<ClassType>;

            _embind_register_value_object(
                TypeID<ClassType>::get(),
                name,
                getSignature(ctor),
                reinterpret_cast<GenericFunction>(ctor),
                getSignature(dtor),
                reinterpret_cast<GenericFunction>(dtor));
        }

        ~value_immutable_unconstructable()
        {
            using namespace internal;
            _embind_finalize_value_object(internal::TypeID<ClassType>::get());
        }

        template <typename InstanceType, typename FieldType>
        value_immutable_unconstructable &field(const char *fieldName, FieldType InstanceType::*field)
        {
            using namespace internal;

            auto getter = &MemberAccess<InstanceType, FieldType>::template getWire<ClassType>;
            auto setter = &dummy_setter;

            _embind_register_value_object_field(
                TypeID<ClassType>::get(),
                fieldName,
                TypeID<FieldType>::get(),
                getSignature(getter),
                reinterpret_cast<GenericFunction>(getter),
                getContext(field),
                TypeID<FieldType>::get(),
                getSignature(setter),
                reinterpret_cast<GenericFunction>(setter),
                getContext(field));
            return *this;
        }
    };

    template <typename T, typename Base>
    using ReplaceIfDerived = std::conditional_t<
        std::is_base_of_v<Base, T>,
        Base,
        T>;

    template <typename T>
    using ReplaceIfEnum = decltype([]
                                   {
        if constexpr (std::is_enum_v<T>)
        {
            return std::underlying_type_t<T>{};
        }
        else
        {
            return T{};
        } }());

    template <typename T, typename Base>
    using ReplaceIfDerivedOrEnum = ReplaceIfDerived<ReplaceIfEnum<T>, Base>;

    template <typename ReturnPolicy, typename ReturnType, typename T>
    struct TupleInvoker;

    template <typename ReturnPolicy, typename ReturnType, typename... Types>
    struct TupleInvoker<ReturnPolicy, ReturnType, std::tuple<Types...>> : internal::Invoker<ReturnPolicy, ReturnType, Types...>
    {
    };

    namespace internal
    {
        template <typename... Policies>
        struct ValWithPolicies
        {
            template <size_t Index, typename T>
            struct MapWithPolicies
            {
                typedef typename ExecutePolicies<Policies...>::template With<T, Index>::type type;
            };

            template <typename T>
            struct ArgTypeList;

            template <typename... Args>
            struct ArgTypeList<std::tuple<Args...>>
            {
                unsigned getCount() const
                {
                    return sizeof...(Args);
                }

                const TYPEID *getTypes() const
                {
                    return ArgArrayGetter<
                        typename MapWithIndex<TypeList, MapWithPolicies, Args...>::type>::get();
                }
            };
        };
    }

    // register a function that converts arguments and return to val if needed
    // also converts enums to their underlying type
    template <typename ReturnType, typename... Args, typename... Policies>
    void smart_function(const char *name, ReturnType (*fn)(Args...), Policies...)
    {
        using NewReturnType = ReplaceIfDerivedOrEnum<ReturnType, val>;
        using NewArgs = typename std::tuple<ReplaceIfDerivedOrEnum<Args, val>...>;
        using NewSig = typename std::tuple<ReplaceIfDerivedOrEnum<ReturnType, val>, ReplaceIfDerivedOrEnum<Args, val>...>;

        using namespace internal;
        typename ValWithPolicies<Policies...>::template ArgTypeList<NewSig> args;
        using ReturnPolicy = GetReturnValuePolicy<NewReturnType, Policies...>::tag;
        auto invoke = TupleInvoker<ReturnPolicy, NewReturnType, NewArgs>::invoke;
        _embind_register_function(
            name,
            args.getCount(),
            args.getTypes(),
            getSignature(invoke),
            reinterpret_cast<GenericFunction>(invoke),
            reinterpret_cast<GenericFunction>(fn),
            isAsync<Policies...>::value,
            isNonnullReturn<Policies...>::value);
    }

    template <typename T>
    auto sanitizeValue(T &&arg)
    {
        if constexpr (std::is_enum_v<std::decay_t<T>>)
        {
            return static_cast<std::underlying_type_t<std::decay_t<T>>>(arg);
        }
        else if constexpr (std::is_base_of_v<val, std::decay_t<T>>)
        {
            return arg.template as<val>();
        }
        else
        {
            return std::forward<T>(arg);
        }
    };

    template <typename T>
    class callback : public val
    {
    };
    template <typename ReturnType, typename... Args>
    class callback<ReturnType(Args...)> : public val
    {
    public:
        ReturnType operator()(Args... args)
        {
            using namespace internal;

            return internalCall<EM_INVOKER_KIND::FUNCTION, WithPolicies<>, val>(as_handle(), nullptr, sanitizeValue(std::forward<Args>(args))...).template as<ReturnType>();
        }
    };

    template <typename T>
    class typed_array : public val
    {
    public:
        typed_array() : val(emscripten::val::array()) {};
        typed_array(emscripten::val v) : val(v) {};
        typed_array(std::vector<T> v) : val(emscripten::val::array())
        {
            for (std::size_t i = 0; i < v.size(); i++)
            {
                push_back(v[i]);
            };
        };
        template <std::size_t N>
        typed_array(std::array<T, N> v) : val(emscripten::val::array())
        {
            for (std::size_t i = 0; i < N; i++)
            {
                push_back(v[i]);
            }
        };
        void push_back(T v) { this->call<void>("push", emscripten::val(v)); };
        T operator[](int i)
        {
            if constexpr (std::is_base_of_v<val, T>)
            {
                return val::operator[](i);
            }
            return val::operator[](i).template as<T>();
        };
        int size() { return val::operator[]("length").template as<int>(); };
    };

    template <typename T>
    class typed_range : public typed_array<T>
    {
        static_assert(std::is_integral_v<T>, "T must be an integral type");

    public:
        typed_range() : typed_array<T>(emscripten::val::array()) {};
        typed_range(emscripten::val v) : typed_array<T>(v) {};

        T min() { return val::operator[](0).template as<T>(); };
        T max() { return val::operator[](1).template as<T>(); };
    };
}
